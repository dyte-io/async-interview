import Head from 'next/head';
import { useRouter } from 'next/router';
import { FormEvent, useCallback, useReducer, useState } from 'react';

interface Form {
  name: string;
  email: string;
}

export default function Home() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useReducer(
    (state: Form, payload: Partial<Form>) => {
      return { ...state, ...payload };
    },
    { name: '', email: '' }
  );

  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (form.email.trim() === '' || form.name.trim() === '') {
        return;
      }

      setSubmitting(true);

      try {
        const res = await fetch('/api/meeting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(
            'There was an error when starting the interview, check console for error'
          );
          console.log(res.status, data);
          return;
        }

        const { token } = data.data;

        router.push({
          pathname: '/interview',
          query: {
            token,
          },
        });
      } finally {
        setSubmitting(false);
      }
    },
    [form, router]
  );

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <Head>
        <title>Async Interview Sample - Dyte</title>
      </Head>
      <div className="flex w-full max-w-screen-md flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-3xl font-bold text-blue-600">
          Async Video Interview
        </h1>

        <form
          className="mt-4 flex w-full max-w-sm flex-col gap-3"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onInput={(e) => setForm({ name: e.currentTarget.value })}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onInput={(e) => setForm({ email: e.currentTarget.value })}
            required
          />

          <button
            className="h-10 rounded-md bg-blue-600 font-semibold text-white"
            disabled={submitting}
          >
            {submitting ? 'Starting...' : 'Start'}
          </button>
        </form>
      </div>
    </div>
  );
}
