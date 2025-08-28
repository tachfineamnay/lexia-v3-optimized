import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  CheckIcon,
  PlayIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const Landing = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: SparklesIcon,
      title: "IA Multi-modèles",
      description: "GPT-4, Claude et Gemini travaillent ensemble pour vous accompagner",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      title: "Assistant 24/7",
      description: "Un coach virtuel disponible à tout moment pour répondre à vos questions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ChartBarIcon,
      title: "Suivi intelligent",
      description: "Visualisez votre progression et recevez des conseils personnalisés",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: ShieldCheckIcon,
      title: "Sécurité maximale",
      description: "Vos données sont chiffrées et protégées selon les normes les plus strictes",
      color: "from-orange-500 to-red-500"
    }
  ];

  const benefits = [
    "Réduction du temps de préparation de 60%",
    "Taux de réussite de 95% avec notre accompagnement",
    "Support personnalisé par IA avancée",
    "Interface intuitive et moderne"
  ];

  const testimonials = [
    {
      name: "Marie L.",
      role: "VAE Commerce obtenue",
      content: "Grâce à Lexia, j'ai pu structurer mon dossier en 3 mois au lieu de 6 !",
      rating: 5
    },
    {
      name: "Thomas B.",
      role: "VAE Informatique en cours",
      content: "L'IA m'aide vraiment à formuler mes expériences de manière professionnelle.",
      rating: 5
    },
    {
      name: "Sophie M.",
      role: "VAE RH obtenue",
      content: "Le suivi personnalisé fait toute la différence. Je recommande !",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="relative z-50">
        <nav className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <AcademicCapIcon className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Lexia V4</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
                Connexion
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition"
              >
                Commencer
              </Link>
            </motion.div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Transformez votre
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                expérience en diplôme
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              L'assistant VAE nouvelle génération qui combine l'intelligence de GPT-4, Claude et Gemini 
              pour vous accompagner vers la réussite.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-purple-500/25 transition group"
                >
                  Démarrer gratuitement
                  <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/demo"
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-full hover:bg-white/20 transition"
                >
                  Voir la démo
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">95%</div>
              <div className="text-gray-400 mt-2">Taux de réussite</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400">3 mois</div>
              <div className="text-gray-400 mt-2">Durée moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">24/7</div>
              <div className="text-gray-400 mt-2">Assistance IA</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Une technologie révolutionnaire
            </h2>
            <p className="text-xl text-gray-300">
              Découvrez comment Lexia V4 réinvente l'accompagnement VAE
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ils ont réussi avec Lexia
            </h2>
            <p className="text-xl text-gray-300">
              Rejoignez des milliers de candidats satisfaits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12"
          >
            <RocketLaunchIcon className="h-12 w-12 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à transformer votre carrière ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Commencez votre parcours VAE dès aujourd'hui avec l'aide de notre IA
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:shadow-xl transition group"
              >
                Créer mon compte gratuitement
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Lexia V4. Tous droits réservés. | 
            <Link to="/privacy" className="ml-2 hover:text-white transition">Confidentialité</Link> | 
            <Link to="/terms" className="ml-2 hover:text-white transition">CGU</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 