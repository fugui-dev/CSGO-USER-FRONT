import { useRouter } from 'vue-router';

export function useOpenPage() {
  const router = useRouter();

  const openPage = (id) => {
    router.push(`/openBox/${id}`);
  };
  return { openPage };
}