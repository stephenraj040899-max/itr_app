const amount = (text, patterns) => {
    for (const pattern of patterns) {
        const raw = pattern.exec(text)?.[1]?.replace(/[₹,\s]/g, "");
        if (raw && /^\d+(?:\.\d{1,2})?$/.test(raw))
            return Math.round(Number(raw));
    }
    return null;
};

const field = (name, value, documentId, confidence) => ({
    name,
    value,
    confidence: value === null ? 0 : confidence,
    sourceDocumentId: documentId,
    sourcePage: null,
    sourceRegion: null,
    extractionMethod: "DETERMINISTIC",
    extractorName: "income-field-extractor",
    extractorVersion: "1.0.1",
    validated: value !== null,
    reviewStatus: value === null ? "REVIEW_REQUIRED" : "DETECTED"
});

export function extractIncomeFields(text, documentId, type) {
    if (!["FORM_16", "FORM_16_PART_A", "FORM_16_PART_B", "SALARY_SLIP"].includes(type))
        return [];

    const gross = amount(text, [
        /gross\s+(?:salary|pay|earnings?)[^\d]{0,40}([\d,]+(?:\.\d{1,2})?)/i,
        /total\s+(?:gross|earnings?)[^\d]{0,40}([\d,]+(?:\.\d{1,2})?)/i,
        /gross\s+amount[^\d]{0,40}([\d,]+(?:\.\d{1,2})?)/i
    ]);
    const tds = amount(text, [/(?:tax\s+deducted|tds)[^\d]{0,30}([\d,]+(?:\.\d{1,2})?)/i]);
    const exempt = amount(text, [/(?:allowances?\s+exempt|exemptions?\s+under\s+section\s+10)[^\d]{0,30}([\d,]+(?:\.\d{1,2})?)/i]);
    const professionalTax = amount(text, [/professional\s+tax[^\d]{0,30}([\d,]+(?:\.\d{1,2})?)/i]);
    const standard = amount(text, [/standard\s+deduction[^\d]{0,30}([\d,]+(?:\.\d{1,2})?)/i]);
    const month = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})\b/i.exec(text);

    return [
        field("gross_salary_rupees", gross, documentId, .96),
        field("tds_rupees", tds, documentId, .96),
        field("exempt_allowances_rupees", exempt, documentId, .9),
        field("professional_tax_rupees", professionalTax, documentId, .9),
        field("reported_standard_deduction_rupees", standard, documentId, .9),
        field("salary_month", month ? `${month[1].toUpperCase()} ${month[2]}` : null, documentId, .9)
    ];
}
