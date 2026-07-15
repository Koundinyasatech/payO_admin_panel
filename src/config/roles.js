export const ROLE_ACCESS = {
  '/':              ['super_admin', 'kyc_admin', 'operations_admin', 'support_admin'],
  '/kyc':           ['super_admin', 'kyc_admin'],
  '/users':         ['super_admin', 'operations_admin', 'support_admin'],
  '/wallets':       ['super_admin', 'operations_admin'],
  '/analytics':     ['super_admin', 'kyc_admin', 'operations_admin'],
  '/audit':         ['super_admin', 'kyc_admin', 'operations_admin', 'support_admin'],
  '/notifications': ['super_admin', 'kyc_admin', 'operations_admin', 'support_admin'],
  '/transactions':  ['super_admin', 'operations_admin'],
  '/referrals':     ['super_admin', 'operations_admin'],
  '/reports':       ['super_admin', 'kyc_admin', 'operations_admin', 'support_admin'],
};

export const ROLE_LABELS = {
  super_admin:       'Super Admin',
  kyc_admin:         'KYC Admin',
  operations_admin:  'Operations Admin',
  support_admin:     'Support Admin',
};