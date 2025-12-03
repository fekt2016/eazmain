import React from 'react';
import { motion } from 'framer-motion';
import JobCard from './JobCard';
import {
  JobsSection,
  JobsContainer,
  JobsTitle,
  JobsDescription,
  JobsGrid,
} from './careers.styles';

const jobsData = [
  {
    id: 1,
    title: 'Senior Full-Stack Developer',
    department: 'Engineering & Tech',
    location: 'Remote / Accra, Ghana',
    type: 'Full-time',
    description: 'Build and scale our e-commerce platform using modern technologies.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Product & Design',
    location: 'Remote / Lagos, Nigeria',
    type: 'Full-time',
    description: 'Design intuitive user experiences for our marketplace platform.',
  },
  {
    id: 3,
    title: 'Logistics Coordinator',
    department: 'Logistics',
    location: 'Accra, Ghana',
    type: 'Full-time',
    description: 'Coordinate delivery operations and optimize fulfillment processes.',
  },
  {
    id: 4,
    title: 'Customer Success Manager',
    department: 'Customer Support',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help customers succeed and build lasting relationships.',
  },
  {
    id: 5,
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Remote / Nairobi, Kenya',
    type: 'Full-time',
    description: 'Drive brand growth and customer acquisition across channels.',
  },
  {
    id: 6,
    title: 'Seller Success Associate',
    department: 'Seller Success',
    location: 'Remote',
    type: 'Full-time',
    description: 'Empower sellers to grow their businesses on our platform.',
  },
];

const CareerJobs = ({ navigate }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <JobsSection id="jobs">
      <JobsContainer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        <JobsTitle>Featured Job Openings</JobsTitle>
        <JobsDescription>
          Join our team and help shape the future of e-commerce in Africa
        </JobsDescription>
        <JobsGrid>
          {jobsData.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              navigate={navigate}
              variants={fadeUp}
            />
          ))}
        </JobsGrid>
      </JobsContainer>
    </JobsSection>
  );
};

export default CareerJobs;

