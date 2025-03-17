import type React from "react"
import Button from "./Button"
import RadialGradient from "./RadialGradient"
import { headerIntroData } from "../assets/lib/data"
import { useSectionInView } from "../assets/lib/hooks"
import { useActiveSectionContext } from "../context/active-section-context"
import { useLanguage } from "../context/language-context"
import { BsMouse } from "react-icons/bs"

const profilePicture = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/me-sGLJdm7P1vkZ58FH0u2OAJdAlOCgpP.webp"

const HeaderIntro: React.FC = () => {
  const { language } = useLanguage()
  const { ref } = useSectionInView("Home", 0.5)
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext()

  return (
    <section
      className="hero flex flex-col justify-center gap-10 items-center h-full max-lg:h-full max-lg:gap-6"
      ref={ref}
      id="home"
    >
      <RadialGradient scale="scale-y-125" opacity="opacity-30" />

      <div className="flex flex-col items-center gap-8">
        <img
          src={profilePicture || "/placeholder.svg"}
          alt={headerIntroData.profilepicture}
          className="w-48 h-48 rounded-full shadow-2xl object-cover"
        />
        <h1 className="text-5xl font-bold text-center">
          {language === "BG" ? headerIntroData.title.bg : headerIntroData.title.en}
          <span className="wave text-5xl ml-2">👋</span>
        </h1>
      </div>

      <p className="w-3/4 text-center text-xl max-lg:w-full max-lg:px-8">
        {language === "BG" ? headerIntroData.description.bg : headerIntroData.description.en}
      </p>

      <div className="flex gap-6 mt-8 max-lg:flex-col">
        {headerIntroData.buttons.map((button, index) => (
          <Button
            key={index}
            label={language === "BG" ? button.label.bg : button.label.en}
            iconSVG={button.icon}
            link={
              button.type === "primary"
                ? "https://docs.sentient-aiep.xyz/introduction"
                : `#${button.name.toLowerCase()}`
            }
            buttoncolor={button.color}
            onClick={() => {
              setActiveSection(button.name)
              setTimeOfLastClick(Date.now())
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-10 animate-bounce">
        <BsMouse className="text-4xl" />
      </div>
    </section>
  )
}

export default HeaderIntro

