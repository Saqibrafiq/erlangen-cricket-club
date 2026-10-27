import { describe, expect, it } from 'vitest'

import { checkImageUpload, IMAGE_UPLOAD_MAX_BYTES } from './image-upload'

describe('checkImageUpload', () => {
  it('accepts JPEG, PNG and WebP up to the size limit', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(checkImageUpload({ type, size: IMAGE_UPLOAD_MAX_BYTES })).toBeNull()
    }
  })

  it('names the problem with anything else', () => {
    expect(checkImageUpload({ type: 'image/gif', size: 10 })).toBe('type')
    expect(checkImageUpload({ type: 'application/pdf', size: 10 })).toBe('type')
    expect(checkImageUpload({ type: 'image/jpeg', size: IMAGE_UPLOAD_MAX_BYTES + 1 })).toBe('size')
  })
})
