import { extractIncomeFields } from "../extraction/income-field-extractor.js";
import { extractDeductionFields } from "../extraction/deduction-field-extractor.js";

const rules = [
    ["AIS", /annual information statement|\bais\b/i, "AIS_MARKER"], ["TIS", /taxpayer information summary|\btis\b/i, "TIS_MARKER"], ["FORM_26AS", /form\s*26as/i, "26AS_MARKER"], ["FORM_10BE", /form\s*10be/i, "10BE_MARKER"], ["FORM_16", /form\s*no\.?\s*16|certificate under section 203/i, "FORM16_MARKER"], ["SALARY_SLIP", /salary slip|payslip|pay\s*slip|net pay/i, "PAYSLIP_MARKER"],
    ["HEALTH_INSURANCE_PREMIUM", /health insurance|mediclaim|medical insurance premium/i, "HEALTH_POLICY_MARKER"], ["LIFE_INSURANCE_PREMIUM", /life insurance premium|lic premium/i, "LIFE_POLICY_MARKER"], ["TUITION_FEE_RECEIPT", /tuition fee|school fee/i, "TUITION_MARKER"], ["NPS_CONTRIBUTION", /national pension system|\bpran\b|nps contribution/i, "NPS_MARKER"], ["PPF", /public provident fund|\bppf\b/i, "PPF_MARKER"], ["EPF", /employees provident fund|\bepf\b/i, "EPF_MARKER"], ["ELSS", /equity linked savings scheme|\belss\b/i, "ELSS_MARKER"], ["NSC", /national savings certificate|\bnsc\b/i, "NSC_MARKER"], ["HOME_LOAN_PRINCIPAL_CERTIFICATE", /home loan principal|principal repayment/i, "HOME_PRINCIPAL_MARKER"], ["EDUCATION_LOAN_INTEREST", /education loan interest|section\s*80e/i, "EDUCATION_LOAN_MARKER"], ["BANK_INTEREST_CERTIFICATE", /interest certificate|interest earned/i, "INTEREST_MARKER"], ["DONATION_80G", /80g|donation receipt/i, "80G_MARKER"], ["TAX_PAYMENT_CHALLAN", /challan|cin\b|bsr code/i, "CHALLAN_MARKER"]
];

const nullField = (documentId) => ({ name: "document_total", value: null, confidence: 0, sourceDocumentId: documentId, sourcePage: null, sourceRegion: null, extractionMethod: "DETERMINISTIC", extractorName: "deterministic-classifier", extractorVersion: "1.0.1", validated: false, reviewStatus: "DETECTED" });

const issuer = (text) => {
    const patterns = [
        /employer(?:'s)?\s+(?:name)?\s*[:\-]\s*([^\r\n]{3,80})/i,
        /(?:insurer|insurance\s+company|company\s+name)\s*[:\-]\s*([^\r\n]{3,80})/i,
        /(?:school|institution|bank|fund|issuer|donee)\s*(?:name)?\s*[:\-]\s*([^\r\n]{3,80})/i
    ];
    for (const pattern of patterns) {
        const match = pattern.exec(text)?.[1]?.trim();
        if (match)
            return match;
    }
    return null;
};

export function classifyDeterministically(text, filename, documentId, assessmentYear) {
    const source = `${filename}\n${text.slice(0, 200_000)}`;
    const hit = rules.find(([, rule]) => rule.test(source));
    const documentType = hit?.[0] ?? "UNKNOWN";
    const detectedIssuer = issuer(text);
    const date = /(20\d{2})[-\/]([01]\d)[-\/]([0-3]\d)/.exec(text);
    const fields = [nullField(documentId), ...extractIncomeFields(text, documentId, documentType), ...extractDeductionFields(text, documentId, documentType)];
    const incomeDocument = ["FORM_16", "FORM_16_PART_A", "FORM_16_PART_B", "SALARY_SLIP"].includes(documentType);
    const hasVerifiedGross = fields.some((item) => item.name === "gross_salary_rupees" && item.value !== null && item.confidence >= .75);
    const baseConfidence = documentType === "FORM_16" ? .96 : documentType !== "UNKNOWN" ? .9 : .25;

    return {
        documentType,
        issuer: detectedIssuer,
        documentDate: date ? `${date[1]}-${date[2]}-${date[3]}` : null,
        financialYear: null,
        assessmentYear,
        candidateTaxSections: [],
        confidence: incomeDocument && !hasVerifiedGross ? Math.min(baseConfidence, .74) : baseConfidence,
        rationaleCodes: hit ? [hit[2], ...(incomeDocument && !hasVerifiedGross ? ["GROSS_SALARY_REVIEW_REQUIRED"] : [])] : ["NO_RELIABLE_MARKER"],
        fields
    };
}
