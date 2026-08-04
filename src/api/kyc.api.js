import api from "./Axios";

// ─── Transformer ──────────────────────────────────────────────────────────────
const transformKYC = (record) => {
  if (!record) return null;

  let aadharFrontUrl = null;
  let panCardUrl = null;
  let passportUrl = null;
  let selfieUrl = null;
  let cancelChequeUrl = null;
  let bankStatementUrl = null
  let passbookUrl = null;

  // ── Handle nested documents array ──
  if (Array.isArray(record.documents) && record.documents.length > 0) {
    record.documents.forEach(doc => {
      const docType = (doc.document_type || '').toLowerCase();
      const url = fixUrl(doc.front_image_url);

      if (docType.includes('aadhaar')) {
        aadharFrontUrl = url;
      } else if (docType.includes('pan')) {
        panCardUrl = url;
      } else if (docType.includes('passport')) {
        passportUrl = url;
      } else if (docType.includes('selfie')) {
        selfieUrl = url;
      } else if (docType.includes('bank')) {
        bankStatementUrl = url;
      }
    });

    const firstDoc = record.documents[0];
    const status = record.status || firstDoc?.status || 'not_started';

    return {
      _id: String(record.KYC_doc_id || record.userid || ''),
      userId: {
        _id: String(record.userid || ''),
        name: record.name || 'Unknown',
        mobile: record.mobile || '',   // <-- added
        email: record.email || '',      // <-- added
      },
      fullName: record.name || 'Unknown',
      status: mapStatus(status),
      createdAt: record.submitted_on || firstDoc?.submitted_on || new Date().toISOString(),
      rejectionReason: record.Rejection_Reason || firstDoc?.Rejection_Reason || '',
      aadharFrontUrl,
      panCardUrl,
      passportUrl,
      selfieUrl,
      cancelChequeUrl,
      bankStatementUrl,
      passbookUrl,
      documentType: record.document_type || 'unknown',
      issuingCountry: record.issuing_country || '',
      country: record.Country || '',
      expiryDate: record.Expiry_Date || '',
      updatedOn: record.Updated_On || '',
    };
  }

  // ── Fallback to flat structure ──
  const docType = (record.document_type || '').toLowerCase();
  const url = fixUrl(record.front_image_url);

  if (docType.includes('aadhaar')) {
    aadharFrontUrl = url;
  } else if (docType.includes('pan')) {
    panCardUrl = url;
  } else if (docType.includes('passport')) {
    passportUrl = url;
  } else if (docType.includes('selfie')) {
    selfieUrl = url;
  } else if (docType.includes('bank')) {
    bankStatementUrl = url;
  }

  return {
    _id: String(record.KYC_doc_id || record.userid || ''),
    userId: {
      _id: String(record.userid || ''),
      name: record.name || 'Unknown',
      mobile: record.mobile || '',   // <-- added
      email: record.email || '',      // <-- added
    },
    fullName: record.name || 'Unknown',
    status: mapStatus(record.status),
    createdAt: record.submitted_on || new Date().toISOString(),
    rejectionReason: record.Rejection_Reason || '',
    aadharFrontUrl,
    panCardUrl,
    passportUrl,
    selfieUrl,
    cancelChequeUrl,
    bankStatementUrl,
    passbookUrl,
    documentType: record.document_type || 'unknown',
    issuingCountry: record.issuing_country || '',
    country: record.Country || '',
    expiryDate: record.Expiry_Date || '',
    updatedOn: record.Updated_On || '',
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const apiBase = process.env.REACT_APP_API_URL || '';

const fixUrl = (url) => {
  if (!url) return null;
  if (url.includes('localhost:3001')) {
    return url.replace(/^https?:\/\/[^\/]+/, '');
  }
  return url;
};

const mapStatus = (status) => {
  if (!status) return 'not_started';
  const statusMap = {
    'Under Review': 'under_review',
    'Pending': 'not_started',
    'Approved': 'approved',
    'Verified': 'approved',
    'Rejected': 'rejected',
  };
  return statusMap[status] || 'not_started';
};

// ─── GET all submissions ─────────────────────────────────────────────────────
export const getAllSubmissions = async () => {
  try {
    const res = await api.get("/api/admin/kyc/all-submissions", {
      params: { _t: Date.now() }
    });

    const responseData = res.data?.data || res.data || {};
    const records = responseData.Records || [];
    const transformed = records.map(transformKYC).filter(Boolean);

    return {
      ...res,
      data: {
        ...res.data,
        kycs: transformed,
        total: responseData.Total_Count || records.length,
      }
    };
  } catch (error) {
    console.error('getAllSubmissions error:', error);
    throw error;
  }
};


// ─── Approve & Reject (combined) ────────────────────────────────────────────
export const approveRejectKYC = (KYC_doc_id, response, rejectReason = '') => {
  return api.patch(`/api/admin/kyc/approve-reject/${KYC_doc_id}`, {
    response,
    rejectReason,   // exact field name expected by backend
  });
};