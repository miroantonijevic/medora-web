import type { UIFieldServerComponent } from 'payload'

import './inquiryAdmin.scss'

const SectionHeading: UIFieldServerComponent = ({ field }) => {
  const label = typeof field.label === 'string' ? field.label : ''

  if (!label) return null

  return (
    <div className="inquiry-section-heading">
      <span className="inquiry-section-heading__text">{label}</span>
    </div>
  )
}

export default SectionHeading
