/**
 * generateStaticParams that reads the database must not fail the build when the database is not
 * reachable (for example while building the Docker image). Returning no params makes Next render
 * each page on its first request and cache it from then on, exactly like a prebuilt page afterwards.
 */
export async function staticParamsOrEmpty<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load()
  } catch (err) {
    console.warn(
      'generateStaticParams could not read the database; pages will render on first request:',
      err instanceof Error ? err.message : err,
    )
    return []
  }
}
