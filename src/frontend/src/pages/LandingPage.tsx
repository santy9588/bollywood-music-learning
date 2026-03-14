import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Brain,
  ChevronRight,
  Headphones,
  Mic2,
  Music,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { CourseCard } from "../components/CourseCard";
import { useGetAllCourses } from "../hooks/useQueries";
import { SEED_COURSES } from "../hooks/useQueries";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description:
      "Our AI engine analyzes your progress and suggests the perfect next lesson based on your learning style.",
  },
  {
    icon: Users,
    title: "Expert Bollywood Instructors",
    description:
      "Learn from professional musicians who have performed in major Bollywood productions and concerts.",
  },
  {
    icon: Headphones,
    title: "100+ Iconic Songs",
    description:
      "Practice with a curated library of Bollywood classics from every era, from the golden age to today.",
  },
  {
    icon: Award,
    title: "Certification on Completion",
    description:
      "Earn a verified certificate for each course you complete and showcase your skills professionally.",
  },
  {
    icon: Zap,
    title: "Live Interactive Sessions",
    description:
      "Join live Q&A sessions with instructors and connect with fellow learners worldwide.",
  },
  {
    icon: Music,
    title: "Structured Curriculum",
    description:
      "Follow a carefully crafted learning path from basics to advanced, covering theory and practice.",
  },
];

const CATEGORIES = [
  {
    icon: "🎤",
    label: "Vocals",
    desc: "Classical & contemporary Bollywood singing",
    color: "from-red-50 to-rose-50 border-red-200",
    textColor: "text-red-700",
  },
  {
    icon: "🥁",
    label: "Instruments",
    desc: "Tabla, harmonium, sitar & more",
    color: "from-amber-50 to-yellow-50 border-amber-200",
    textColor: "text-amber-700",
  },
  {
    icon: "💃",
    label: "Dance",
    desc: "Bollywood & classical dance forms",
    color: "from-pink-50 to-rose-50 border-pink-200",
    textColor: "text-pink-700",
  },
  {
    icon: "🎵",
    label: "Theory",
    desc: "Ragas, talas & music composition",
    color: "from-blue-50 to-indigo-50 border-blue-200",
    textColor: "text-blue-700",
  },
];

const TESTIMONIALS = [
  {
    name: "Anjali Mehta",
    role: "Vocals Student",
    avatar: "AM",
    text: "I went from a complete beginner to performing at my cousin's wedding in just 3 months! The AI feedback helped me fix my breathing technique faster than any in-person class.",
    rating: 5,
  },
  {
    name: "Rohan Verma",
    role: "Tabla Learner",
    avatar: "RV",
    text: "Ravi Kumar's tabla course is extraordinary. The structured approach from basic strokes to complex compositions made learning feel natural and enjoyable.",
    rating: 5,
  },
  {
    name: "Sunita Kapoor",
    role: "Dance Enthusiast",
    avatar: "SK",
    text: "Meera Patel is an incredible teacher. I've been trying to learn Bollywood dance for years and this platform finally made it click for me. Worth every rupee!",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LandingPage() {
  const { data: courses } = useGetAllCourses();
  const displayCourses = courses?.slice(0, 4) ?? SEED_COURSES;

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative hero-gradient text-white min-h-[90vh] flex items-center overflow-hidden">
        {/* Background photo — cinematic at 45% opacity */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-bollywood.dim_1600x700.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            opacity: 0.45,
          }}
        />
        {/* Dark vignette to keep text readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        {/* Decorative mandala / ornament texture — right half, subtle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-texture-overlay-transparent.dim_1200x800.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "screen",
            opacity: 0.07,
          }}
        />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-8 w-64 h-64 rounded-full bg-red-900/20 blur-3xl pointer-events-none" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-amber-400/30 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  India's #1 AI-Powered Bollywood Music Platform
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6"
              >
                Learn Bollywood
                <br />
                <span className="text-transparent bg-clip-text gold-gradient">
                  Music Like Never
                </span>
                <br />
                Before
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-white/75 mb-8 max-w-lg leading-relaxed"
              >
                Master vocals, instruments, dance, and music theory with
                AI-guided lessons and world-class Bollywood instructors.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 mb-10"
              >
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="gold-gradient text-foreground hover:opacity-90 border-0 font-bold shadow-lg shadow-amber-900/40 px-8 text-base"
                    data-ocid="landing.browse_courses_button"
                  >
                    Browse Courses
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 text-base"
                    data-ocid="landing.hero_cta_button"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </motion.div>

              {/* Stats row — bigger, bolder */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { value: "10K+", label: "Students" },
                  { value: "50+", label: "Instructors" },
                  { value: "100+", label: "Songs" },
                  { value: "4.9★", label: "Rating" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-center"
                  >
                    <div className="text-2xl font-display font-bold text-amber-300 leading-none mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/55 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Floating course preview card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main featured card */}
                <div className="bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                  <div className="h-48 overflow-hidden">
                    <img
                      src="/assets/generated/course-vocals.dim_600x400.jpg"
                      alt="Featured course"
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black/40" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Featured Course
                    </span>
                    <h3 className="font-display font-bold text-white text-lg mt-1 mb-2">
                      Bollywood Vocals Mastery
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>🎤</span>
                        <span>Priya Sharma</span>
                      </div>
                      <span className="text-amber-300 font-bold text-lg">
                        $49
                      </span>
                    </div>
                  </div>
                </div>
                {/* Floating mini badge */}
                <div className="absolute -bottom-4 -left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-900/30">
                  ✓ 10,000+ enrolled
                </div>
                {/* Rating badge */}
                <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-800" />
                  4.9
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="ornament-divider text-saffron text-sm font-semibold uppercase tracking-widest mb-4">
              Explore Categories
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              What Do You Want to Learn?
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to="/courses">
                  <div
                    className={`bg-gradient-to-br ${cat.color} border rounded-xl p-6 text-center card-hover cursor-pointer`}
                  >
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <h3
                      className={`font-display font-bold text-sm mb-1 ${cat.textColor}`}
                    >
                      {cat.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Courses ─── */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="ornament-divider text-saffron text-sm font-semibold uppercase tracking-widest mb-4">
                Featured Courses
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Start Your Musical Journey
              </h2>
            </div>
            <Link
              to="/courses"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-crimson hover:text-crimson/80 transition-colors"
            >
              View all courses
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCourses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                data-ocid={`courses.item.${i + 1}` as never}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="ornament-divider text-saffron text-sm font-semibold uppercase tracking-widest mb-4">
              Why Choose Us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              The Platform Built for Bollywood Lovers
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border/60 rounded-xl p-6 card-hover"
              >
                <div className="w-11 h-11 rounded-xl bg-crimson/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-crimson" />
                </div>
                <h3 className="font-display font-bold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 bollywood-gradient text-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="ornament-divider text-amber-300 text-sm font-semibold uppercase tracking-widest mb-4">
              Student Stories
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Loved by Thousands of Learners
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }, (_, j) => (
                    <Star
                      key={`star-${testimonial.name}-${j}`}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-white/85 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-300">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-crimson/5 via-saffron/5 to-amber-50 border border-amber-200/60 rounded-2xl p-12"
          >
            <div className="text-5xl mb-4">🎶</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join thousands of students who are mastering Bollywood music with
              AI guidance. Your first lesson is just a click away.
            </p>
            <Link to="/courses">
              <Button
                size="lg"
                className="bg-crimson hover:bg-crimson/90 text-white border-0 px-10 shadow-lg shadow-red-900/20"
                data-ocid="landing.hero_cta_button"
              >
                Start Learning Today
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
