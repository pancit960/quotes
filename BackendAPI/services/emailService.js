//will send an email via Nodemailer
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM = `"'Plant Repair Srvices'" <${process.env.EMAIL_FROM}>`;

function currency(n) {
    return `$${parseFloat(n || 0).toFixed(2)}`;
}

function itemsTable(items) {
    return items
        .map((item, i) => ` ${i + 1}. ${item.description} - ${currency(item.price)}`)
        .join('\n');

}

//send sanctioned quote to our customer
async function sendSanctionedQuote(quote, items) {
  const discountLine =
    quote.discount_val && parseFloat(quote.discount_val) > 0
        ? `\nDiscount (${quote.discount_type === 'percentage'
        ? quote.discount_val + '%'
        : 'flat ' + currency(quote.discount_val)}): -${currency(quote.subtotal - quote.final_total)}`
        : '';
    
    //body of email
    const body = `
Dear ${quote.customer_name},
 
Thank you for your interest in Group 3B's Plant Repair Services. Please find your approved quote below.
 
Quote #${quote.id}
Date: ${new Date(quote.sanctioned_at || quote.updated_at).toLocaleDateString()}
 
LINE ITEMS
──────────────────────────────────────
${itemsTable(items)}
──────────────────────────────────────
Subtotal: ${currency(quote.subtotal)}
Discount: -${currency(quote.discount_final || 0)}
TOTAL:    ${currency(quote.final_total)}
 
This quote is valid for 1 hour before we change our mind!
 
Thank you,
Team 3B Plant Repair
`.trim();
 
  await transporter.sendMail({
    from:    FROM,
    to:      quote.customer_email,
    subject: `Your Plant Repair Services Quote #${quote.id}`,
    text:    body,
  });
 
  console.log(`[Email] Sanctioned quote #${quote.id} sent to ${quote.customer_email}`);
}

//purchase order confirmation to the customer
async function sendPurchaseOrderConfirmation(quote, items, order) {
    const body = `
Dear ${quote.customer_name},
 
Your purchase order has been placed and is being processed by our hardworking data miners! Details below:
 
Purchase Order #${order.id}  
Quote #: ${quote.id}
Order Date: ${new Date(order.created).toLocaleDateString()}
Processing Date: ${quote.processing_date ? new Date(quote.processing_date).toLocaleDateString() : 'TBD'}
 
LINE ITEMS
──────────────────────────────────────
${itemsTable(items)}
──────────────────────────────────────
Subtotal: ${currency(quote.subtotal)}
Quote Discount: -${currency(quote.discount_final || 0)}
Total: ${currency(order.quote_amount)}
We will begin work on your order soon within the next 300 years!
 
Thank you for your business,
Plant Repair Services
`.trim();
 
  await transporter.sendMail({
    from:    FROM,
    to:      quote.customer_email,
    subject: `Purchase Order Confirmation #${order.id} — Plant Repair Services`,
    text:    body,
  });
 
  console.log(`[Email] PO confirmation #${order.id} sent to ${quote.customer_email}`);
}
 

module.exports = {sendSanctionedQuote, sendPurchaseOrderConfirmation};