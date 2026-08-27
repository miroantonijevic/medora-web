export type InquiryStatus = 'new' | 'contacted' | 'closed' | 'spam'

export const STATUS_ORDER: InquiryStatus[] = ['new', 'contacted', 'closed', 'spam']

export const STATUS_META: Record<InquiryStatus, { label: string; color: string; background: string }> = {
  new: { label: 'New', color: '#1d4ed8', background: '#dbeafe' },
  contacted: { label: 'Contacted', color: '#b45309', background: '#fef3c7' },
  closed: { label: 'Closed', color: '#4b5563', background: '#e5e7eb' },
  spam: { label: 'Spam', color: '#b91c1c', background: '#fee2e2' },
}
