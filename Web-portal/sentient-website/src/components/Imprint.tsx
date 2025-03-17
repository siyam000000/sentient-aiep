import React from "react"
import { useLanguage } from "../context/language-context"

const Imprint = () => {
  const { language } = useLanguage()

  return (
    <React.Fragment>
      {language === "BG" ? (
        <article className="flex flex-col gap-6 max-w-[70vw]">
          <h1>Златимир Георгиев Петров (2024-2025) Copyright©</h1>
        </article>
      ) : (
        <article className="flex flex-col gap-6 max-w-[70vw]">
          <h1>Zlatimir Georgiev Petrov (2024-2025) Copyright©</h1>
        </article>
      )}
    </React.Fragment>
  )
}

export default Imprint

