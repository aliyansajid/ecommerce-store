"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An unexpected error occurred. Please try again.';

  if (error === 'OAuthAccountNotLinked') {
    errorMessage = 'You have an existing account with the same email address. Please log in using the provider originally used.';
  } else if (error === 'CredentialsSignin') {
    errorMessage = 'Sign in failed. Check the details you provided are correct.';
  } else if (error === 'Error connecting to mongoose') {
    errorMessage = 'Error connecting to the database. Please try again later.';
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl text-center">Authentication Error</h1>
        <p className="text-center">{errorMessage}</p>
        <div className="flex justify-center">
          <Link href="/" className="btn btn-primary">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}