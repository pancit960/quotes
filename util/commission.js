//calculate commission for our quotes and orderdb tables
function computeCommissionData(finalAmount, commissionRate) {
    //be sure to set defaults if there are no values assigned
    const amount = parseFloat(finalAmount) || 0;
    const rate = parseFloat(commissionRate) || 0;

    const commissionTotal = round(amount * rate);

    return {
        //quote table
        commision_pct: rate,
        commission_total: commissionTotal,
        //orderdb table
        commission_rate: rate,
        commission_amt: commissionTotal
    };
}

//format rate to display
function formatRate(rate) {
    return `${(parseFloat(rate || 0) * 100).toFixed(2)}%`;
}

//round util
function round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

module.exports = {computeCommissionData, formatRate};