import { motion } from 'framer-motion';
import { Users, BookOpen, Award, Globe, Heart, Zap } from 'lucide-react';

const team = [
  { name: 'Sarah Johnson', role: 'CEO & Co-Founder', img: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Michael Chen', role: 'CTO & Co-Founder', img: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Emma Williams', role: 'Head of Education', img: 'https://i.pravatar.cc/150?img=5' },
  { name: 'David Kim', role: 'Head of Product', img: 'https://i.pravatar.cc/150?img=4' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-extrabold mb-6">Our Mission</h1>
            <p className="text-xl text-primary-200 leading-relaxed">
              We believe that education is a fundamental right. Our mission is to make high-quality learning accessible to everyone, everywhere, regardless of background or budget.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Users, value: '50,000+', label: 'Active Students' },
            { icon: BookOpen, value: '2,000+', label: 'Total Courses' },
            { icon: Globe, value: '120+', label: 'Countries' },
            { icon: Award, value: '30,000+', label: 'Certificates' },
          ].map(({ icon: Icon, value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <Icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                SmartCourse was founded in 2020 with a simple idea: democratize quality education. We started as a small team of educators and engineers who believed everyone deserved access to world-class learning.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Today, we're a global platform serving learners across 120+ countries with thousands of courses taught by industry experts.
              </p>
            </div>
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&h=350&fit=crop" alt="Team" className="rounded-2xl shadow-xl" />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">Meet Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <img src={member.img} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
