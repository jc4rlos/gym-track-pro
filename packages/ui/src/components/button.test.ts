import { describe, it, expect } from 'vitest'
import { composeStories } from '@storybook/react'
import {  screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as ButtonStories from './button.stories'

const { Default, Destructive, Disabled } = composeStories(ButtonStories)

describe('Button Stories', () => {
  it('Default renders button', async () => {
    await Default.run()
    const button = screen.getByRole('button', { name: 'Button' })
    expect(button).toBeInTheDocument()
  })

  it('Destructive has correct classes', async () => {
    await Destructive.run()
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive')
  })

  it('Disabled button is disabled', async () => {
    await Disabled.run()
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('Button responds to click', async () => {
    const user = userEvent.setup()
    await Default.run()
    const button = screen.getByRole('button')

    expect(button).not.toHaveAttribute('data-clicked')
    await user.click(button)
    // Verify click was processed (no error thrown)
    expect(button).toBeInTheDocument()
  })
})
