const teachers = [
  {
    id: 1,
    name: { uk: 'Анна Коваленко', en: 'Anna Kovalenko' },
    specialty: { uk: 'Розмовна англійська та впевненість', en: 'Speaking and confidence' },
    description: {
      uk: 'Анна допомагає дорослим студентам подолати мовний бар’єр і вільно спілкуватися англійською в повсякденному житті та роботі.',
      en: 'Anna helps adult learners overcome the language barrier and speak English fluently in everyday life and work.'
    },
    fullDescription: {
      uk: 'Анна створює легку та підтримуючу атмосферу на уроках, де студенти починають говорити з першого заняття без страху помилитися. Поєднує живі дискусії, розбір фільмів і практичну граматику під цілі кожного учня.',
      en: 'Anna creates a supportive classroom environment where students start speaking from day one without fear of mistakes. She combines lively discussions, film clips, and practical grammar tailored to each learner.'
    },
    rating: 4.9,
    level: 'A2–C1',
    experienceYears: 8,
    experience: 'teacherExperience1',
    hourlyRate: 12,
    photoClass: '',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн'], en: ['Online'] },
    specializations: { uk: ['Розмовна практика', 'Загальна англійська'], en: ['Conversation practice', 'General English'] },
    education: { uk: ['CELTA', 'Магістр прикладної лінгвістики (ЛНУ ім. І. Франка)'], en: ['CELTA', 'MA in Applied Linguistics'] }
  },
  {
    id: 2,
    name: { uk: 'Максим Шевченко', en: 'Maksym Shevchenko' },
    specialty: { uk: 'Ділова англійська та переговори', en: 'Business English and negotiations' },
    description: {
      uk: 'Максим готує спеціалістів до міжнародних переговорів, презентацій, ділового листування та роботи в зарубіжних компаніях.',
      en: 'Maksym prepares professionals for international negotiations, presentations, business correspondence, and global teams.'
    },
    fullDescription: {
      uk: 'Максим має 6 років досвіду корпоративного викладання. На уроках моделює реальні бізнес-кейси: від пітчингу ідей та проведення мітингів до складних переговорів із клієнтами.',
      en: 'Maksym has 6 years of corporate teaching experience. Lessons simulate real business cases: from pitching ideas and leading meetings to complex client negotiations.'
    },
    rating: 4.7,
    level: 'B1–C2',
    experienceYears: 6,
    experience: 'teacherExperience2',
    hourlyRate: 14,
    photoClass: 'teacher-photo-two',
    image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн', 'Офлайн'], en: ['Online', 'In person'] },
    specializations: { uk: ['Ділова англійська', 'Англійська для IT'], en: ['Business English', 'English for IT'] },
    education: { uk: ['CELTA', 'Cambridge BEC Higher'], en: ['CELTA', 'Cambridge BEC Higher'] }
  },
  {
    id: 3,
    name: { uk: 'Софія Мельник', en: 'Sofia Melnyk' },
    specialty: { uk: 'Підготовка до IELTS', en: 'IELTS preparation' },
    description: {
      uk: 'Софія спеціалізується на інтенсивній підготовці до IELTS Academic і General, допомагаючи вийти на бал 7.5+ за чітким планом.',
      en: 'Sofia specialises in intensive IELTS Academic and General preparation, helping students reach band 7.5+ with a clear roadmap.'
    },
    fullDescription: {
      uk: 'Софія детально розбирає критерії оцінювання кожної секції іспиту, вчить уникати типових пасток у Reading та Listening і перевіряє есе з детальним фідбеком.',
      en: 'Sofia breaks down the assessment criteria for every exam section, teaches how to avoid common traps in Reading and Listening, and gives detailed feedback on essays.'
    },
    rating: 5.0,
    level: 'B2–C2',
    experienceYears: 10,
    experience: 'teacherExperience3',
    hourlyRate: 16,
    photoClass: 'teacher-photo-three',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн'], en: ['Online'] },
    specializations: { uk: ['IELTS', 'Cambridge English', 'Академічне письмо'], en: ['IELTS', 'Cambridge English', 'Academic writing'] },
    education: { uk: ['DELTA', 'IELTS Teacher Training'], en: ['DELTA', 'IELTS Teacher Training'] }
  },
  {
    id: 4,
    name: { uk: 'Ірина Бондар', en: 'Iryna Bondar' },
    specialty: { uk: 'Англійська для подорожей та релокації', en: 'English for travel and relocation' },
    description: {
      uk: 'Ірина проводить практичні уроки для тих, хто хоче впевнено почуватися в аеропортах, готелях, банках і повсякденних ситуаціях за кордоном.',
      en: 'Iryna delivers practical lessons for learners who want to feel confident in airports, hotels, banks, and everyday situations abroad.'
    },
    fullDescription: {
      uk: 'Ірина будує кожне заняття навколо реальних діалогів та аудіювання різних акцентів. Ви швидко опануєте живу лексику для подорожей і перестанете губитися в розмові з носіями мови.',
      en: 'Iryna builds every lesson around real-life dialogues and listening to various accents. You will quickly master practical travel vocabulary without freezing up.'
    },
    rating: 4.6,
    level: 'A1–B2',
    experienceYears: 5,
    hourlyRate: 9,
    photoClass: 'teacher-photo-two',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська', 'Польська'], en: ['Ukrainian', 'English', 'Polish'] },
    format: { uk: ['Онлайн'], en: ['Online'] },
    specializations: { uk: ['Англійська для подорожей', 'Розмовна практика'], en: ['English for travel', 'Conversation practice'] },
    education: { uk: ['TKT', 'Бакалавр філології (КНУ ім. Т. Шевченка)'], en: ['TKT', 'BA in Philology'] }
  },
  {
    id: 5,
    name: { uk: 'Дмитро Лисенко', en: 'Dmytro Lysenko' },
    specialty: { uk: 'Англійська для IT-фахівців', en: 'English for IT professionals' },
    description: {
      uk: 'Дмитро допомагає розробникам, тестувальникам і PM проходити технічні співбесіди, вести дейлі-мітинги та захищати архітектурні рішення.',
      en: 'Dmytro helps developers, QA engineers, and PMs pass technical interviews, run daily stand-ups, and present architectural decisions.'
    },
    fullDescription: {
      uk: 'Дмитро працював у продуктових IT-командах, тому чудово знає технічну термінологію та стиль спілкування в Slack, Jira і на демо-дзвінках із замовниками.',
      en: 'Dmytro has worked inside product IT teams and knows technical terminology and communication styles across Slack, Jira, and client demo calls.'
    },
    rating: 4.9,
    level: 'B1–C2',
    experienceYears: 9,
    hourlyRate: 15,
    photoClass: '',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн'], en: ['Online'] },
    specializations: { uk: ['Англійська для IT', 'Ділова англійська'], en: ['English for IT', 'Business English'] },
    education: { uk: ['CELTA', 'Сертифікат English for IT'], en: ['CELTA', 'English for IT Certificate'] }
  },
  {
    id: 6,
    name: { uk: 'Наталія Романюк', en: 'Natalia Romaniuk' },
    specialty: { uk: 'Англійська для підлітків та НМТ', en: 'English for teens and exams' },
    description: {
      uk: 'Наталія готує старшокласників до НМТ та розвиває живу англійську через сучасні теми, інтерактивні проєкти й без нудного зубріння.',
      en: 'Natalia prepares high-school students for national exams and develops natural English through modern topics and interactive projects.'
    },
    fullDescription: {
      uk: 'Наталія знаходить спільну мову з підлітками, систематизує всю шкільну граматику у зрозумілі схеми та допомагає впевнено скласти іспити на високий бал.',
      en: 'Natalia connects easily with teenagers, structures grammar into clear frameworks, and helps students achieve top exam scores.'
    },
    rating: 4.8,
    level: 'A2–B2',
    experienceYears: 7,
    experience: 'teacherExperience3',
    hourlyRate: 10,
    photoClass: 'teacher-photo-three',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн', 'Офлайн'], en: ['Online', 'In person'] },
    specializations: { uk: ['Англійська для підлітків', 'Загальна англійська'], en: ['English for teens', 'General English'] },
    education: { uk: ['CELTA', 'TKT Young Learners'], en: ['CELTA', 'TKT Young Learners'] }
  },
  {
    id: 7,
    name: { uk: 'Олександр Петренко', en: 'Oleksandr Petrenko' },
    specialty: { uk: 'Англійська для медицини', en: 'English for healthcare' },
    description: {
      uk: 'Олександр навчає лікарів, інтернів і медичних спеціалістів професійної комунікації з пацієнтами та участі в міжнародних конференціях.',
      en: 'Oleksandr trains doctors, interns, and medical specialists in patient communication and international conference presentations.'
    },
    fullDescription: {
      uk: 'Олександр спеціалізується на медичній термінології, читанні клінічних досліджень англійською та підготовці лікарів до стажувань у європейських клініках.',
      en: 'Oleksandr specialises in medical terminology, reading clinical studies in English, and preparing doctors for internships in European clinics.'
    },
    rating: 4.8,
    level: 'B1–C2',
    experienceYears: 11,
    hourlyRate: 15,
    photoClass: 'teacher-photo-two',
    image: 'https://images.unsplash.com/photo-1537511446984-935f663eb1f4?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн'], en: ['Online'] },
    specializations: { uk: ['Англійська для медицини', 'Медична термінологія'], en: ['English for healthcare', 'Medical terminology'] },
    education: { uk: ['CELTA', 'OET Preparation Specialist'], en: ['CELTA', 'OET Preparation Specialist'] }
  },
  {
    id: 8,
    name: { uk: 'Марія Ткаченко', en: 'Maria Tkachenko' },
    specialty: { uk: 'Англійська з нуля (Beginner – Elementary)', en: 'English from scratch (Beginner – Elementary)' },
    description: {
      uk: 'Марія допомагає початківцям закласти міцну базу читання, вимови й граматики у спокійному темпі без стресу та складних термінів.',
      en: 'Maria helps beginners build a solid foundation in reading, pronunciation, and grammar at a comfortable pace without stress.'
    },
    fullDescription: {
      uk: 'Марія спеціалізується на роботі з рівнями A1–A2. Пояснює правила простими прикладами з життя та допомагає заговорити базовими фразами вже в перший місяць навчання.',
      en: 'Maria specialises in A1–A2 levels. She explains grammar with simple everyday examples and gets beginners speaking basic phrases within the first month.'
    },
    rating: 4.7,
    level: 'A1–A2',
    experienceYears: 4,
    hourlyRate: 8,
    photoClass: '',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн'], en: ['Online'] },
    specializations: { uk: ['Загальна англійська', 'Англійська для початківців'], en: ['General English', 'English for beginners'] },
    education: { uk: ['TKT', 'Бакалавр англійської філології'], en: ['TKT', 'BA in English Philology'] }
  },
  {
    id: 9,
    name: { uk: 'Катерина Савчук', en: 'Kateryna Savchuk' },
    specialty: { uk: 'Академічне письмо та вступ за кордон', en: 'Academic writing and study abroad' },
    description: {
      uk: 'Катерина допомагає студентам писати мотиваційні листи, есе та наукові статті англійською для вступу до закордонних університетів.',
      en: 'Kateryna helps students write motivation letters, essays, and research papers in English for admission to foreign universities.'
    },
    fullDescription: {
      uk: 'Катерина працює над структурою тексту, академічним стилем, аргументацією та редагуванням реальних документів студентів для стипендіальних програм.',
      en: 'Kateryna focuses on text structure, academic register, argumentation, and editing students’ actual application documents for scholarship programmes.'
    },
    rating: 4.6,
    level: 'B2–C2',
    experienceYears: 8,
    hourlyRate: 13,
    photoClass: 'teacher-photo-three',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн'], en: ['Online'] },
    specializations: { uk: ['Академічне письмо', 'IELTS Writing'], en: ['Academic writing', 'IELTS Writing'] },
    education: { uk: ['DELTA', 'Магістр TESOL'], en: ['DELTA', 'MA in TESOL'] }
  },
  {
    id: 10,
    name: { uk: 'Андрій Кравець', en: 'Andrii Kravets' },
    specialty: { uk: 'Підготовка до Cambridge English (FCE / CAE)', en: 'Cambridge English preparation (FCE / CAE)' },
    description: {
      uk: 'Андрій готує до безстрокових сертифікатів Cambridge B2 First та C1 Advanced за структурованою програмою з регулярними пробними тестами.',
      en: 'Andrii prepares learners for lifelong Cambridge B2 First and C1 Advanced certificates with structured practice and mock exams.'
    },
    fullDescription: {
      uk: 'Андрій має 12 років викладацького стажу, детально розбирає Use of English, вчить тайм-менеджменту на іспиті та доводить граматику й лексику до автоматизму.',
      en: 'With 12 years of teaching experience, Andrii breaks down Use of English, teaches exam time-management, and sharpens grammar and vocabulary.'
    },
    rating: 4.9,
    level: 'B2–C2',
    experienceYears: 12,
    hourlyRate: 15,
    photoClass: 'teacher-photo-two',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=900&h=620&q=85',
    languages: { uk: ['Українська', 'Англійська'], en: ['Ukrainian', 'English'] },
    format: { uk: ['Онлайн', 'Офлайн'], en: ['Online', 'In person'] },
    specializations: { uk: ['Cambridge English', 'IELTS', 'Граматика'], en: ['Cambridge English', 'IELTS', 'Grammar'] },
    education: { uk: ['DELTA', 'Cambridge Assessment Examiner'], en: ['DELTA', 'Cambridge Assessment Examiner'] }
  }
];

export default teachers;