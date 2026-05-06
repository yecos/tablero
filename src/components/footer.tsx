'use client'

import { Sparkles } from 'lucide-react'

const footerLinks = {
  Product: ['Features', 'Canvas', 'Pricing', 'Templates', 'Brand Kit'],
  Resources: ['Blog', 'Tutorials', 'API Docs', 'Community', 'Changelog'],
  Company: ['About', 'Careers', 'Press', 'Contact', 'Partners'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                DesignAI
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              The world&apos;s first AI design agent. Create professional designs through conversation.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {['𝕏', 'in', 'gh', 'yt'].map((social) => (
                <div
                  key={social}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} DesignAI. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Powered by advanced AI models
          </p>
        </div>
      </div>
    </footer>
  )
}
