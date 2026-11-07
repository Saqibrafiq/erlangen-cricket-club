'use client'

import { Check, Moon, Shirt, Sun, SunMoon, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { DropdownMenu } from 'radix-ui'
import { useRef, useState } from 'react'

import { THEME_CHOICES, type ThemeChoice } from '@/shared/config/theme'
import { cn } from '@/shared/lib/cn'

import { DROPDOWN_ITEM_VARIANTS, DROPDOWN_PANEL_VARIANTS } from './motion-presets'
import { useTheme } from '@/shared/lib/use-theme'

const ICONS: Record<ThemeChoice, LucideIcon> = {
  auto: SunMoon,
  light: Sun,
  dark: Moon,
  ecc: Shirt,
}

/**
 * Each theme's page, action and band colours, for the swatches. A picture of the theme, kept in
 * step with globals.css by hand: the menu shows all themes at once, so it can't read them from
 * the page's tokens.
 */
const SWATCHES: Record<Exclude<ThemeChoice, 'auto'>, readonly [string, string, string]> = {
  light: ['#d6f1e2', '#194cb1', '#d4e995'],
  dark: ['#0e141f', '#f79643', '#fdbe45'],
  ecc: ['#101e4b', '#e99f50', '#691214'],
}

function Swatch({ choice }: { choice: ThemeChoice }) {
  if (choice === 'auto') {
    // Half light, half dark: follows the device.
    return (
      <span
        aria-hidden="true"
        className="size-5 shrink-0 rounded-full border border-border-default"
        style={{
          background: `linear-gradient(135deg, ${SWATCHES.light[0]} 50%, ${SWATCHES.dark[0]} 50%)`,
        }}
      />
    )
  }
  return (
    <span aria-hidden="true" className="flex shrink-0 -space-x-1.5">
      {SWATCHES[choice].map((color) => (
        <span
          key={color}
          className="size-4 rounded-full border border-border-default"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}

/**
 * Picks the site's look: Auto (follows the device), Light, Dark or ECC (the club kit). The choice
 * is remembered in this browser and applied before the page paints.
 */
export function ThemeSwitcher() {
  const t = useTranslations('theme')
  const { choice, setChoice } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const CurrentIcon = ICONS[choice]

  /** The new theme spreads from the button, where the eye already is. */
  function choose(next: ThemeChoice) {
    const rect = triggerRef.current?.getBoundingClientRect()
    setChoice(next, rect && { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  return (
    // Not modal: a small menu shouldn't hide the whole page from assistive technology.
    <DropdownMenu.Root modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger
        ref={triggerRef}
        aria-label={t('open', { theme: t(`choices.${choice}`) })}
        title={t('label')}
        className="inline-flex size-11 items-center justify-center rounded-full text-text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text-default data-[state=open]:bg-surface-muted"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={choice}
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="inline-flex"
          >
            <CurrentIcon aria-hidden="true" className="size-5" />
          </motion.span>
        </AnimatePresence>
      </DropdownMenu.Trigger>
      <AnimatePresence>
        {isOpen && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content
              forceMount
              asChild
              align="end"
              sideOffset={8}
              collisionPadding={16}
            >
              <motion.div
                variants={DROPDOWN_PANEL_VARIANTS}
                initial="closed"
                animate="open"
                exit="exit"
                style={{ transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)' }}
                className="z-50 w-60 rounded-2xl border border-border-default bg-surface-default p-2 text-text-default shadow-xl"
              >
                <DropdownMenu.Label className="px-3 pt-1.5 pb-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
                  {t('label')}
                </DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={choice}
                  onValueChange={(value) => {
                    const next = THEME_CHOICES.find((option) => option === value)
                    if (next) choose(next)
                  }}
                >
                  {THEME_CHOICES.map((option) => {
                    const Icon = ICONS[option]
                    return (
                      <DropdownMenu.RadioItem
                        key={option}
                        value={option}
                        asChild
                        // Stay open, so themes can be tried one after another; Escape or a click
                        // outside closes the menu.
                        onSelect={(event) => {
                          event.preventDefault()
                        }}
                        className={cn(
                          'relative flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none select-none',
                          'transition-colors duration-150 data-highlighted:bg-surface-muted',
                        )}
                      >
                        <motion.div variants={DROPDOWN_ITEM_VARIANTS}>
                          {/* The selection glides from the old choice to the new one. */}
                          {option === choice && (
                            <motion.span
                              layoutId="theme-choice"
                              aria-hidden="true"
                              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                              className="absolute inset-0 rounded-lg bg-surface-highlight ring-1 ring-brand-primary/30"
                            />
                          )}
                          <Icon
                            aria-hidden="true"
                            className="relative size-4 shrink-0 text-text-muted"
                          />
                          <span className="relative flex-1">{t(`choices.${option}`)}</span>
                          <span className="relative flex">
                            <Swatch choice={option} />
                          </span>
                          <span className="relative flex size-4 shrink-0 items-center justify-center">
                            <DropdownMenu.ItemIndicator>
                              <Check aria-hidden="true" className="size-4 text-brand-primary" />
                            </DropdownMenu.ItemIndicator>
                          </span>
                        </motion.div>
                      </DropdownMenu.RadioItem>
                    )
                  })}
                </DropdownMenu.RadioGroup>
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  )
}
