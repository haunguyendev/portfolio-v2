/** Data structure for CV/Resume PDF generation */
export interface CvData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
  experience: CvExperience[];
  skills: CvSkillGroup[];
  education: CvEducation[];
  certificates?: CvCertificate[];
}

export interface CvExperience {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

export interface CvSkillGroup {
  category: string;
  items: string[];
}

export interface CvEducation {
  institution: string;
  degree: string;
  duration: string;
}

export interface CvCertificate {
  title: string;
  issuer: string;
}
