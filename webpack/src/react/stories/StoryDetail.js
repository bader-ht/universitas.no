import R from 'ramda'
import React from 'react'
import { connect } from 'react-redux'
import { getCurrentStory, fieldChanged } from 'stories/duck'
import { detailFields as fields } from 'stories/model'
import { formatDateTime, formatDate } from 'utils/modelUtils'
import StoryTypeSelect from 'storytypes/StoryTypeSelect'

const ChoiceField = ({ choices, value, editable, ...args }) =>
  editable
    ? <select value={value} {...args}>
        {choices.map(({ value, display_name }) => (
          <option key={value} value={value}> {display_name} </option>
        ))}
      </select>
    : <span>{value}</span>

const IntegerField = ({ value, editable, choices, ...args }) =>
  editable
    ? <input type="number" value={value} {...args} />
    : <span {...args}>{value}</span>

const LinkField = ({ value, editable, label = 'lenke', ...args }) => (
  <a {...args} href={value}>{label || value}</a>
)

const DateField = ({ value, editable, choices, ...args }) =>
  editable
    ? <input type="date" value={value} {...args} />
    : <span {...args}>{formatDate(value)}</span>

const DateTimeField = ({ value, editable, choices, ...args }) =>
  editable
    ? <input type="datetime" value={value} {...args} />
    : <span {...args}>{formatDateTime(value)}</span>

const StringField = ({ value, editable, choices, ...args }) =>
  editable
    ? <input style={{ width: '100%' }} type="text" value={value} {...args} />
    : <span {...args}>{value}</span>

const TextField = ({ value, editable, choices, ...args }) =>
  editable
    ? <textarea type="text" value={value} {...args} />
    : <span {...args}>{value}</span>

const fieldTypes = {
  choice: ChoiceField,
  storytype: StoryTypeSelect,
  string: StringField,
  text: TextField,
  link: LinkField,
  integer: IntegerField,
  date: DateField,
  datetime: DateTimeField,
}

const DetailField = ({ label, type, ...args }) => {
  const TypeField = fieldTypes[type] || StringField
  return (
    <div className={`DetailField ${type}`}>
      <span className="label">{label}: </span>
      <TypeField className="Field" {...args} />
    </div>
  )
}

const Detail = ({ pdfs = [], dirty, fieldChanged, ...data }) => (
  <div>
    {fields.map(({ key, ...args }) => (
      <DetailField
        key={key}
        name={key}
        value={data[key]}
        onChange={e => fieldChanged(data.id, key, e.target.value)}
        {...args}
      />
    ))}
    <div>
      {pdfs.map((props, index) => (
        <PdfPreview key={index} name={props.url} {...props} />
      ))}
    </div>
  </div>
)

export default connect(getCurrentStory, { fieldChanged })(Detail)
