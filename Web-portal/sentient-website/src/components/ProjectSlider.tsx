"use client"

import type React from "react"
import { useRef } from "react"
import Button from "./Button"
import { projectsData, toastMessages } from "../assets/lib/data"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCards, Pagination } from "swiper/modules"
import { ToastContainer, toast } from "react-toastify"
import { Tooltip as ReactTooltip } from "react-tooltip"
import { useSectionInView } from "../assets/lib/hooks"
import { useLanguage } from "../context/language-context"
import { motion, useScroll, useTransform } from "framer-motion"
import "react-toastify/dist/ReactToastify.css"
import "swiper/css"
import "swiper/css/effect-cards"
import "swiper/css/pagination"

const ProjectSlider: React.FC = () => {
  const { ref } = useSectionInView("Prototypes")
  const { language } = useLanguage()
  const animationReference = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: animationReference,
    offset: ["0 1", "1.33 1"],
  })
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1])

  const notifyServerRequest = () => {
    toast.info(language === "BG" ? toastMessages.loadingProject.bg : toastMessages.loadingProject.en)
  }

  return (
    <section className="projects-section py-20 bg-gradient-to-b from-gray-900 to-gray-800" id="prototypes" ref={ref}>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <motion.div
        ref={animationReference}
        style={{ scale: scaleProgress, opacity: opacityProgress }}
        className="container mx-auto px-4"
      >
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          <span className="text-orange-500">&lt;</span>
          {language === "BG" ? "Прототипи" : "Prototypes"}
          <span className="text-orange-500">/&gt;</span>
        </h2>

        <Swiper
          effect={"cards"}
          grabCursor={true}
          modules={[EffectCards, Autoplay, Pagination]}
          className="w-full max-w-4xl"
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
        >
          {projectsData.map((project, index) => (
            <SwiperSlide key={index} className="bg-gray-800 rounded-xl shadow-xl p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2">
                  <h3 className="text-2xl font-semibold text-white mb-4">{project.title}</h3>
                  <p className="text-gray-300 mb-6">
                    {language === "BG" ? project.description : project.description_EN}
                  </p>
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-white mb-2">
                      {language === "BG" ? "Технологии" : "Technologies"}
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      {project.technologies.map((tech, techIndex) => (
                        <img
                          key={techIndex}
                          src={tech.icon || "/placeholder.svg"}
                          alt={`${tech.name} icon`}
                          className="h-8 w-8"
                          data-tooltip-id="tech-tooltip"
                          data-tooltip-content={tech.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      label="Live Demo"
                      link={project.deploymenturl}
                      iconSVG={project.deploymenticon}
                      buttoncolor={project.colors.main}
                      iconcolor={project.colors.icon}
                      onClick={notifyServerRequest}
                    />
                    <Button
                      label="GitHub"
                      link={project.githuburl}
                      iconSVG={project.githubicon}
                      buttoncolor={project.colors.second}
                      iconcolor={project.colors.icon}
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={`${project.title} mockup`}
                    className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
      <ReactTooltip id="tech-tooltip" place="top" />
    </section>
  )
}

export default ProjectSlider

