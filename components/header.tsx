"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { LanguageSwitcher } from "./language-switcher"
import { MobileBottomNav, DesktopNavbar } from "./mobile-bottom-nav"
import { AuthUserMenu } from "./auth-user-menu"

export function Header() {
  const [isMobile, setIsMobile] = useState(false)
  const [isOverDarkSection, setIsOverDarkSection] = useState(false)
  const { t } = useLanguage()
  const { user, loading, logout, isAdmin } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!isMobile) return

    const handleScroll = () => {
      const howItWorksSection = document.getElementById("how-it-works")
      if (howItWorksSection) {
        const rect = howItWorksSection.getBoundingClientRect()
        const headerBottom = 64 // height of mobile header
        // Check if header overlaps with dark section
        setIsOverDarkSection(rect.top < headerBottom && rect.bottom > 0)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isMobile])

  const textColor = isOverDarkSection ? "#ffffff" : undefined
  const bgStyle = isOverDarkSection
    ? {
        background: "rgba(30, 30, 35, 0.85)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        boxShadow: "0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0.5px 0 rgba(255, 255, 255, 0.15)",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        transition: "all 0.4s ease",
      }
    : {
        background: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        boxShadow: "0 1px 0 rgba(0, 0, 0, 0.03), inset 0 0.5px 0 rgba(255, 255, 255, 0.4)",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.4s ease",
      }

  return (
    <>
      {isMobile && (
        <header className="fixed z-50 top-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full pointer-events-auto" style={bgStyle}>
            <div
              className="flex items-center justify-between px-4 h-16 gap-3"
              style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", width: "100%" }}
            >
              <Link
                href="/"
                className="font-extrabold tracking-tight text-base sm:text-xl flex-shrink-0"
                style={{ color: textColor, transition: "color 0.4s ease" }}
              >
                PartySpace
              </Link>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <LanguageSwitcher variant="navbar" />
                {!loading && (
                  user ? (
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex flex-col items-end">
                        <p className="text-xs sm:text-sm font-semibold" style={{ color: textColor }}>
                          {user.displayName || user.email?.split("@")[0]}
                        </p>
                        {isAdmin && (
                          <p className="text-xs text-accent font-medium">Admin</p>
                        )}
                      </div>
                      <AuthUserMenu variant="mobile" />
                    </div>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="font-bold rounded-full hover:opacity-90 whitespace-nowrap px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base flex-shrink-0 transition-all duration-300 cursor-pointer inline-block"
                      style={{
                        backgroundColor: isOverDarkSection ? "#ffffff" : "var(--foreground)",
                        color: isOverDarkSection ? "#111111" : "var(--background)",
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.4s ease",
                      }}
                    >
                      {t.header.signIn}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile bottom navbar */}
      <MobileBottomNav />

      <DesktopNavbar user={user} loading={loading} logout={logout} isAdmin={isAdmin} />
    </>
  )
}
