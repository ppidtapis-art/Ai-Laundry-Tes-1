import { Suspense } from "react";
import NotaClient from "./NotaClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotaClient />
    </Suspense>
  );
}