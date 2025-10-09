'use client'
import { z } from 'zod'
import React from 'react'
import Header from '@/components/Header'
import { useForm } from 'react-hook-form'
import { Suspense, useState } from 'react'
import StickyNav from '../components/StickyNav'
import { Toggle } from '@/components/ui/toggle'
import { useUpdateUser } from '@/service/user/hook'
import { Progress } from '@/components/ui/progress'
import { zodResolver } from '@hookform/resolvers/zod'
import { setCookie, getCookie } from '@/utils/cookie'
import { useRouter, useSearchParams } from 'next/navigation'
import SportAddButton from '../sport/components/SportAddButton'

const defaultSports = [
  'Football',
  'Basketball',
  'Tennis',
  'Swimming',
  'Running',
  'Gym',
  'Yoga',
  'Cycling',
  'Volleyball',
  'Badminton',
  'Table Tennis',
  'Golf',
]

const sportSchema = z.object({
  sports: z.array(z.string()).min(1, '').max(5, ''),
})
type SportFormType = z.infer<typeof sportSchema>

function SportContent() {
  const router = useRouter()
  const { mutateAsync: updateUser } = useUpdateUser()
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || ''
  const isEditMode = searchParams.get('edit') === 'true'
  const [customSports, setCustomSports] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])

  // Load cookie values on client side only
  React.useEffect(() => {
    const cookie = getCookie('info_sport')
    if (cookie) {
      try {
        const data = JSON.parse(decodeURIComponent(cookie))
        if (data.selected) {
          setSelected(data.selected)
        }
      } catch {}
    }
  }, [])

  React.useEffect(() => {
    setCookie('info_sport', JSON.stringify({ selected }))
  }, [selected])

  const {
    handleSubmit,
    setValue,
    formState: {},
  } = useForm<SportFormType>({
    resolver: zodResolver(sportSchema),
    mode: 'onChange',
    defaultValues: { sports: [] },
  })

  // Sync selected with form
  const handleSelect = (sport: string) => {
    let updated: string[]
    if (selected.includes(sport)) {
      updated = selected.filter((s) => s !== sport)
      if (customSports.includes(sport)) {
        setCustomSports(customSports.filter((s) => s !== sport))
      }
    } else {
      if (selected.length >= 5) {
        return
      }
      updated = [...selected, sport]
    }
    setSelected(updated)
    setValue('sports', updated, { shouldValidate: true })
  }

  const onSubmit = async () => {
    try {
      if (selected.length > 0) {
        await updateUser({
          favoriteSport: selected[0],
        })
      }
    } catch (err) {
      console.error('Failed to update sport info', err)
    }

    // If in edit mode, return to bio page, otherwise continue to next step
    if (isEditMode) {
      router.push('/bio')
    } else {
      router.push(`/info/skill?name=${name}`)
    }
  }

  return (
    <div className="flex flex-col h-full w-full p-8">
      <Progress value={71.46} className="shrink-0" />
      <Header className="mt-4" showBackButton />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between h-full mt-2">
        <div>
          <div className="flex flex-col gap-y-4">
            <h1 className="text-2xl font-bold text-left w-full">
              Welcome to <br /> LongBio, {name}!
            </h1>
            <span className="text-sm font-normal text-left w-full">Are you into sport?</span>
          </div>
          <div className="flex flex-col gap-y-4 mt-10">
            <h2 className="text-xl font-bold mt-8 w-full">
              Choose the sports you are interested in
            </h2>
            <div className="flex flex-wrap gap-2 justify-start md:justify-stretch w-full">
              {[...defaultSports, ...customSports].map((sport) => (
                <Toggle
                  key={sport}
                  pressed={selected.includes(sport)}
                  onPressedChange={() => handleSelect(sport)}
                  disabled={selected.length >= 5 && !selected.includes(sport)}
                  className="data-[state=on]:border-purple-blaze data-[state=on]:text-purple-blaze border border-black hover:text-black px-2 xl:px-4 text-xs xl:text-sm font-normal transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sport}
                </Toggle>
              ))}
              <SportAddButton
                options={customSports}
                setOptions={setCustomSports}
                placeholder="Add your own sport..."
              />
            </div>
          </div>
        </div>
        <StickyNav
          onNext={handleSubmit(onSubmit)}
          onSkip={() => {
            if (isEditMode) {
              router.push('/bio')
            } else {
              router.push(`/info/skill?name=${name}`)
            }
          }}
          className="mt-10"
        />
      </form>
    </div>
  )
}
export default function Sport() {
  return (
    <Suspense>
      <SportContent />
    </Suspense>
  )
}
