import { prisma } from '@/lib/db'

export const defaultAbout = {
  title: 'About Lost Monk Tales',
  tagline: 'Beyond Belief. Toward Understanding.',
  introduction: 'Lost Monk Tales is an independent educational and intellectual initiative of Studio LM, founded by Ar. Sumit K. Pahil, dedicated to exploring world religions, civilisations, philosophy, spirituality, and the deeper questions of human existence.\n\nWe believe that understanding religion requires more than inherited beliefs or unquestioned interpretations. Through academic research, comparative analysis, and philosophical inquiry, we encourage individuals to explore religious traditions with curiosity, critical thinking, and an open mind.\n\nOur mission is to make the Academic & Comparative Study of Religions and Civilisations accessible to everyone — from students, researchers, and educators to independent thinkers and curious individuals across the world.',
  whatWeDo: 'Lost Monk Tales brings together religion, history, philosophy, mythology, mysticism, psychology, and civilisational studies through educational articles, research-based content, digital learning programmes, and thoughtful discussions.',
  quizzesCourses: 'Beyond articles and philosophical discussions, Lost Monk Tales offers interactive quizzes, MCQ practice tests, previous-year question (PYQ) series, mock tests, and exam-oriented study materials to help learners strengthen their knowledge and assess their understanding.\n\nOur educational resources support students preparing for examinations such as UGC NET Comparative Study of Religions (Paper Code 62) and other related humanities and religious studies programmes.\n\nWe are also developing comprehensive online courses designed for both academic learners and anyone interested in understanding world religions and civilisations beyond examination preparation.',
  studioVision: 'As part of Studio LM, our broader interests extend into architecture, art, literature, education, and creative expression. Through architectural design, artistic projects, literary exploration, and educational ventures such as LM Library, we explore how human creativity, knowledge, culture, and philosophy have shaped civilisations throughout history.',
  philosophy: 'We do not seek to promote one religion over another, nor do we encourage blind belief or blind rejection.\n\nInstead, we believe in reading deeply, questioning respectfully, examining multiple interpretations, and recognising both the similarities and differences among human traditions.\n\nBecause the journey towards understanding begins with the humility to say, “I do not know.”\n\nWhether you are a believer, sceptic, scholar, student, or simply a curious human being, Lost Monk Tales welcomes you to explore.',
  closing: 'Not Blind Belief. Not Blind Rejection. Just the Courage to Seek.\n\nLost Monk Tales | An Initiative of Studio LM\n\nExplore. Question. Understand.',
  founderName: 'Ar. Sumit K. Pahil',
  founderDesignation: 'Founder, Lost Monk Tales · Studio LM',
  founderBio: 'Ar. Sumit K. Pahil is an architect, entrepreneur, and independent researcher with a multidisciplinary interest in religion, philosophy, art, literature, and human civilisation. After completing his Bachelor’s degree in Architecture, he pursued a Master’s degree in Comparative Religion from Jamia Millia Islamia University, New Delhi, bringing together his interests in creative expression, academic inquiry, and the study of human cultures.\n\nAs the founder of Studio LM and Lost Monk Tales, he seeks to bridge architecture, art, education, and religious studies while encouraging critical thinking and intellectual curiosity. Through Lost Monk Tales, his vision is to make the academic and comparative study of religions accessible to a wider audience, inspiring individuals to question, explore, and develop their own informed understanding.\n\nHis guiding philosophy: Not blind belief. Not blind rejection. Just the courage to seek.',
  founderImage: '',
}

export async function getAboutPage() {
  try {
    return await prisma.aboutPage.findFirst({
      include: { people: { orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }] } },
    })
  } catch (error) {
    console.error('About page table is unavailable; showing default About content.', error)
    return null
  }
}
