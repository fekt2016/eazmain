import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaBriefcase, FaArrowRight } from 'react-icons/fa';
import {
  JobCardContainer,
  JobHeader,
  JobTitle,
  JobDepartment,
  JobDetails,
  JobDetail,
  JobDetailIcon,
  JobDetailText,
  JobDescription,
  JobButton,
} from './careers.styles';

const JobCard = ({ job, navigate, variants }) => {
  return (
    <JobCardContainer
      variants={variants}
      whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
      transition={{ duration: 0.2 }}
    >
      <JobHeader>
        <JobTitle>{job.title}</JobTitle>
        <JobDepartment>{job.department}</JobDepartment>
      </JobHeader>
      <JobDetails>
        <JobDetail>
          <JobDetailIcon>
            <FaMapMarkerAlt />
          </JobDetailIcon>
          <JobDetailText>{job.location}</JobDetailText>
        </JobDetail>
        <JobDetail>
          <JobDetailIcon>
            <FaBriefcase />
          </JobDetailIcon>
          <JobDetailText>{job.type}</JobDetailText>
        </JobDetail>
      </JobDetails>
      <JobDescription>{job.description}</JobDescription>
      <JobButton
        onClick={() => navigate(`/contact?subject=Job Application: ${job.title}`)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Apply Now
        <FaArrowRight />
      </JobButton>
    </JobCardContainer>
  );
};

export default JobCard;

