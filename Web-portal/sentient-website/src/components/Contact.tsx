"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { contactData, toastMessages } from "../assets/lib/data"
import { useSectionInView } from "../assets/lib/hooks"
import { useLanguage } from "../context/language-context"
import { useTheme } from "../context/theme-context"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Button from "./Button"

const Contact: React.FC = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const { ref } = useSectionInView("Contact")
  const { language } = useLanguage()
  const { theme } = useTheme()

  const animationReference = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: animationReference,
    offset: ["0 1", "1.33 1"],
  })
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // Implement your form submission logic here
      toast.success(language === "BG" ? toastMessages.successEmailSent.bg : toastMessages.successEmailSent.en)
    } catch (error) {
      toast.error(language === "BG" ? toastMessages.failedEmailSent.bg : toastMessages.failedEmailSent.en)
    }
  }

  return (
    <section id="contact" ref={ref} className="py-20 bg-gray-100 dark:bg-gray-900">
      <motion.div
        ref={animationReference}
        style={{ scale: scaleProgress, opacity: opacityProgress }}
        className="container mx-auto px-4"
      >
        <h2 className="text-4xl font-bold text-center mb-8">
          <span className="text-orange-500">&lt;</span>
          {language === "BG" ? contactData.title.bg : contactData.title.en}
          <span className="text-orange-500">/&gt;</span>
        </h2>
        <p className="text-center text-xl mb-12">
          {language === "BG" ? contactData.description.bg : contactData.description.en}
        </p>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {contactData.inputfields.map((field, index) => (
              <div key={index}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === "BG" ? field.placeholder.bg : field.placeholder.en}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={field.name === "name" ? name : field.name === "email" ? email : ""}
                  onChange={(e) =>
                    field.name === "name"
                      ? setName(e.target.value)
                      : field.name === "email"
                        ? setEmail(e.target.value)
                        : null
                  }
                />
              </div>
            ))}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === "BG" ? contactData.textarea.placeholder.bg : contactData.textarea.placeholder.en}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="flex items-center">
              <input
                id="privacy-policy"
                name="privacy-policy"
                type="checkbox"
                required
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="privacy-policy" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                {language === "BG"
                  ? `Съгласявам се Златимир Георгиев Петров да използва моите лични данни (име и имейл адрес), за да се свърже с мен.`
                  : `I agree that Zlatimir Georgiev Petrov may use my personal data (name and e-mail address) to contact me.`}
              </label>
            </div>
            <Button
              type="submit"
              label={language === "BG" ? contactData.button.value.bg : contactData.button.value.en}
              buttoncolor="bg-orange-500 hover:bg-orange-600"
            />
          </form>
        </div>
      </motion.div>
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
        theme={theme === "dark" ? "dark" : "light"}
      />
    </section>
  )
}

export default Contact

