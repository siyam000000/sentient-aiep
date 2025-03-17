import type React from "react"
import Layout from "../layout/layout"
import Footer from "../components/Footer"
import ThemeSwitch from "../components/theme-switch"
import { ScrollProgress } from "../components/ScrollProgress"
import Divider from "../components/Divider"
import ProjectSlider from "../components/ProjectSlider"
import BannerQuote from "../components/BannerQuote"
import SiteBarRight from "../components/SideBarRight"
import SiteBarLeft from "../components/SiteBarLeft"
import TechStack from "../components/TechStack"
import AboutMe from "../components/AboutMe"
import Contact from "../components/Contact"
import HeaderIntro from "../components/HeaderIntro"
import RadialGradient from "../components/RadialGradient"

const Home: React.FC = () => {
  return (
    <>
      <Layout>
        <ThemeSwitch />
        <header className="h-screen">
          <ScrollProgress position={"left"} color={"orange"} height={10} smoothness={true} />
          <SiteBarLeft />
          <HeaderIntro />
          <SiteBarRight />
        </header>
        <main className="relative">
          <BannerQuote style={"withBG"} quoteIndex={0} containerType="quote" />
          <Divider
            thickness="0.25rem"
            direction="outer-right-to-inner-left"
            color="lightblue"
            height="small"
            dividerStyle="solid"
          />

          <TechStack />
          <Divider
            thickness="0.25rem"
            direction="inner-right-to-middle"
            color="lightblue"
            height="middle"
            dividerStyle="solid"
          />

          <BannerQuote style={"noBG"} quoteIndex={1} containerType="statement" />
          <Divider thickness="0.25rem" direction="middle" color="lightblue" height="extraLarge" dividerStyle="solid" />
          <ProjectSlider />
          <div className="relative -mb-24 pb-32 -mt-10">
            <RadialGradient opacity="opacity-30" scale="scale-y-100" position="-top-24" />
            <Divider
              thickness="0.25rem"
              direction="middle-to-inner-left"
              color="lightblue"
              height="middle"
              dividerStyle="solid"
            />

            <AboutMe />
            <Divider
              thickness="0.25rem"
              direction="inner-left-to-middle"
              color="lightblue"
              height="middle"
              dividerStyle="solid"
            />

            <Contact />
          </div>
        </main>
        <Footer />
      </Layout>
    </>
  )
}

export default Home

