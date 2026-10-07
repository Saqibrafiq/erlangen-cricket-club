import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormField, formControlClassName } from './form-field'

describe('FormField', () => {
  it('labels the control', () => {
    render(
      <FormField id="name" label="Name">
        {(control) => <input {...control} className={formControlClassName} />}
      </FormField>,
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveAttribute('aria-invalid')
  })

  it('describes the control with its hint and error, and marks it invalid', () => {
    render(
      <FormField
        id="email"
        label="Email"
        hint="We only use it to reply."
        error="Enter a valid email address."
      >
        {(control) => <input type="email" {...control} />}
      </FormField>,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(
      'We only use it to reply. Enter a valid email address.',
    )
  })

  it('shows an optional marker in the label', () => {
    render(
      <FormField id="message" label="Message" optionalLabel="(optional)">
        {(control) => <textarea {...control} />}
      </FormField>,
    )

    expect(screen.getByRole('textbox', { name: 'Message (optional)' })).toBeInTheDocument()
  })
})
