//functions for price and discount calculations

//compute discount amt given subtotal and discount
function computeDiscount(subtotal, discountType, discountValue) {
    //no discount!
    if(!discountType || !discountValue) {
        return 0;
    }

    //default to 0 if no value
    const value = parseFloat(discountValue) || 0;
    //discount types
    if(discountType === 'amount') {
        return Math.min(value, subtotal);
    }
    if(discountType === 'percentage') {
        const pct = Math.min(Math.max(value, 0), 100);
        return(subtotal * pct) / 100;
    }
    //if no discount type
    return 0;
}

//quote pricing to match the table
function computeQuotePricing(subtotal, discountType, discountValue) {
    const discountAmount = computeDiscount(subtotal, discountType, discountValue);
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return {
        subtotal: round(subtotal),
        //db field
        discount_type: discountType || null,
        discount_val: discountValue || 0,
        discount_final: round(discountAmount),
        finalTotal: round(finalTotal)
    };
}

//order pricing to match orderdb table and update final quote
function computeOrderPricing(quotedTotal, finalDiscount = 0) {
    const discount = Math.max(0, parseFloat(finalDiscount) || 0);
    const finalAmount = Math.max(0, quotedTotal - discount);
    
    return { quote_discount: round(discount), //orderdb.quote_discount
        quote_amount: round(finalAmount) //orderdb.quote_amount
    };
}

//rounding function to round to 2 decimals
function round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

module.exports = {computeDiscount, computeQuotePricing, computeOrderPricing};