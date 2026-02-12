'use client'

import { supabase } from '@/app/_libs/supabase'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useMutationPublic } from '@/app/_hooks/useMutationPublic'

type FormValues = {
  email: string
  password: string
}

export default function Page() {
  const router = useRouter()

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signIn = async (_url: string, arg: FormValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: arg.email,
      password: arg.password,
    })
    if (error) throw error
  }

  const { trigger, isMutating } = useMutationPublic<void, FormValues>(
    'auth/sign-in',
    signIn
  )

  const onSubmit = handleSubmit(async (data) => {
    try {
      await trigger({ email: data.email, password: data.password })
      router.replace('/admin/posts')
    } catch {
      alert('ログインに失敗しました')
    }
  })

  return (
    <div className="flex justify-center pt-60">
      <form onSubmit={onSubmit} className="space-y-4 w-full max-w-100">
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="name@company.com"
            required
            disabled={isMutating}
            {...register('email', { required: true })}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            パスワード
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            required
            disabled={isMutating}
            {...register('password', { required: true })}
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            disabled={isMutating}
          >
            ログイン
          </button>
        </div>
      </form>
    </div>
  )
}
