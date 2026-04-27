//submit purchase order to NIU external processing system
// POST http://blitz.cs.niu.edu/PurchaseOrder/
// order, associate, custid, amount
//responds with date, and commission

const http = require('http');
require('dotenv').config();

const EXTERNAL_URL = 'http://blitz.cs.niu.edu/PurchaseOrder/';

//HTTP POST -> return res[pmse amd reject if call fails
function postJSON(urlString, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const parsed = new URL(urlString);

        const options = {
            hostname: parsed.hostname,
            port: parsed.port || 80,
            path: parsed.pathname,
            nethod: 'POST',
            headers: {'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch {
                    reject(new Error(`External PO system returned non-JSON: ${data}`));
                }
            });
        });

        req.on('error', err => 
            reject(new Error(`External PO system could not be reached: ${err.nessage}`))
        );

        req.write(body);
        req.end();
    });
}

//Public API submission
async function submitOrder({
    quoteId, associateId, customerId, finalTotal, discountAmount = 0
}) {
    const payload = {
        //quote is PO num
        order: String(quoteId),
        associate: String(associateId),
        custid: stringify(customerId),
        amount: paraseFloat(finalTotal).toFixed(2),
    };

    console.log('[ExternalOrder] sending...:', payload);
    const response = await postJSON(EXTERNAL_URL, payload);
    console.log('[ExternalOrder] Response: ', response);

    if(response.error) {
        const msgs = Array.isArray(response.errors) ? response.errors.join('; ') : String(response.errors);
        throw new Error(`External PO system rejected: ${msgs}`);
    }

    const commissionRate = parseFloat(response.commission) / 100;
    const commissionTotal = parseFloat(finalTotal) * commissionRate;

    return {
        //quotes table
        quoteUpdate: {
            quote_status: 'ordered', 
            processing_date: response.date,
            commission_pct: commissionRate,
            commission_total: commissionTotal,
            ordered_at: new Date()
        },

        //orderdb table
        orderRecord: {
            quote_id: quoteId,
            quote_discount: discountAmount,
            commission_amt: commissionTotal,
            commission_rate: commissionRate,
            quote_amount: finalTotal
        }
    }; 
}

module.exports = {submitOrder};