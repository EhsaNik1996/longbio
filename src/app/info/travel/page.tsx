'use client'
import { z } from 'zod'
import { Suspense } from 'react'
import { Info } from 'lucide-react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Progress } from '@/components/ui/progress'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'

const travelStyles = [
  'Luxury Travel',
  'Backpacking',
  'Adventure Travel',
  'Cultural Travel',
  'Road Trip',
  'Eco-Tourism',
  'Solo Travel',
  'Family Travel',
  'Volunteer Travel',
]

const travelSchema = z
  .object({
    styles: z.array(z.string()).optional(),
    country: z.string().optional(),
  })
  .refine(
    (data) => (data.styles && data.styles.length > 0) || (data.country && data.country !== ''),
    {
      message: 'حداقل یکی از گزینه‌های سفر یا کشور را انتخاب کنید.',
      path: ['form'],
    }
  )

function TravelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || ''

  const {
    control,
    handleSubmit,
    formState: {},
  } = useForm({
    resolver: zodResolver(travelSchema),
    defaultValues: { styles: [], country: '' },
    mode: 'onChange',
  })

  const onSubmit = () => {
    router.push(`/info/physical?name=${name}`)
  }

  return (
    <div className="flex flex-col h-full w-full p-8">
      <Progress value={42.9} />
      <Header className="mt-4" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow mt-2 space-x-4">
        <h1 className="text-2xl font-bold">
          Welcome to <br /> Long-Bio, {name}!
        </h1>
        <span className="text-sm font-normal mt-5">Pick your travel style.</span>
        <div className="space-y-4 mt-4">
          <h2 className="text-xl font-bold">What&apos;s your travel style?</h2>
          <Controller
            name="styles"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap justify-stretch gap-1.5 md:gap-2">
                {travelStyles.map((style) => (
                  <Toggle
                    key={style}
                    pressed={field.value?.includes(style)}
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        field.onChange([...(field.value || []), style])
                      } else {
                        field.onChange((field.value || []).filter((s: string) => s !== style))
                      }
                    }}
                    variant="outline"
                    className="data-[state=on]:border-purple-blaze data-[state=on]:text-purple-blaze border-black px-2 xl:px-4 text-xs xl:text-sm font-normal transition rounded-full"
                  >
                    {style}
                  </Toggle>
                ))}
              </div>
            )}
          />
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold">Which countries are on your bucket list?</h2>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <select
                className="w-full border rounded-full px-4 py-2 text-sm mt-3"
                value={field.value}
                onChange={field.onChange}
              >
                <option value="">Choose between countries</option>
              </select>
            )}
          />
        </div>
        <div className="flex items-center gap-1 text-xs mt-2">
          <Info className="size-4" />
          <span>You can always update this later</span>
        </div>
        <Button
          type="submit"
          className="w-full h-fit bg-purple-blaze text-sm font-bold mt-auto rounded-4xl"
        >
          Next
        </Button>
      </form>
      <button
        type="button"
        className="w-full text-sm font-normal mt-2 rounded-4xl"
        onClick={() => router.push(`/info/physical?name=${name}`)}
      >
        skip
      </button>
    </div>
  )
}

export default function Travel() {
  return (
    <Suspense>
      <TravelContent />
    </Suspense>
  )
}
