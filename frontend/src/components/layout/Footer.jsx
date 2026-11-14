import { Link } from 'react-router-dom';
import { GraduationCap, Twitter, Linkedin, Github, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <GraduationCap className="w-7 h-7 text-primary-400" />
              SmartCourse
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Empowering learners worldwide with high-quality online education from expert instructors.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Github, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Platform', links: [{ label: 'Courses', to: '/courses' }, { label: 'About Us', to: '/about' }, { label: 'Pricing', to: '/pricing' }, { label: 'Contact', to: '/contact' }] },
            { title: 'Account', links: [{ label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }, { label: 'Forgot Password', to: '/forgot-password' }] },
            { title: 'Legal', links: [{ label: 'Terms of Service', to: '/terms' }, { label: 'Privacy Policy', to: '/privacy' }, { label: 'Cookie Policy', to: '/cookies' }] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold mb-4">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm hover:text-primary-400 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} SmartCourse Platform. All rights reserved.</p>
          <p className="text-sm">Made with ❤️ for learners everywhere</p>
        </div>
      </div>
    </footer>
  );
}
