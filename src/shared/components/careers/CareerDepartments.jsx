import React from 'react';
import { motion } from 'framer-motion';
import {
  FaCode,
  FaPalette,
  FaCog,
  FaTruck,
  FaHeadset,
  FaBullhorn,
  FaStore,
  FaUsers,
} from 'react-icons/fa';
import {
  DepartmentsSection,
  DepartmentsContainer,
  DepartmentsTitle,
  DepartmentsDescription,
  DepartmentsGrid,
  DepartmentCard,
  DepartmentIcon,
  DepartmentTitle,
  DepartmentText,
  DepartmentButton,
} from './careers.styles';

const departmentsData = [
  {
    icon: <FaCode />,
    title: 'Engineering & Tech',
    description: 'Build scalable platforms, APIs, and innovative solutions using cutting-edge technology.',
    color: '#0078cc',
  },
  {
    icon: <FaPalette />,
    title: 'Product & Design',
    description: 'Design intuitive user experiences and shape products that millions of users love.',
    color: '#7c3aed',
  },
  {
    icon: <FaCog />,
    title: 'Operations',
    description: 'Optimize processes, manage supply chains, and ensure smooth day-to-day operations.',
    color: '#00C896',
  },
  {
    icon: <FaTruck />,
    title: 'Logistics',
    description: 'Coordinate deliveries, manage fulfillment, and ensure products reach customers on time.',
    color: '#e29800',
  },
  {
    icon: <FaHeadset />,
    title: 'Customer Support',
    description: 'Help customers succeed and provide exceptional service that builds lasting relationships.',
    color: '#10b981',
  },
  {
    icon: <FaBullhorn />,
    title: 'Marketing',
    description: 'Tell our story, grow our brand, and connect with customers across multiple channels.',
    color: '#f59e0b',
  },
  {
    icon: <FaStore />,
    title: 'Seller Success',
    description: 'Empower sellers to grow their businesses and achieve success on our platform.',
    color: '#ffc400',
  },
  {
    icon: <FaUsers />,
    title: 'Finance & HR',
    description: 'Support our growth with strategic finance, talent acquisition, and people operations.',
    color: '#ef4444',
  },
];

const CareerDepartments = ({ navigate }) => {
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
    <DepartmentsSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <DepartmentsContainer>
        <DepartmentsTitle>Departments</DepartmentsTitle>
        <DepartmentsDescription>
          Explore opportunities across our diverse teams
        </DepartmentsDescription>
        <DepartmentsGrid>
          {departmentsData.map((dept, index) => (
            <DepartmentCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <DepartmentIcon $color={dept.color}>
                {dept.icon}
              </DepartmentIcon>
              <DepartmentTitle>{dept.title}</DepartmentTitle>
              <DepartmentText>{dept.description}</DepartmentText>
              <DepartmentButton
                onClick={() => navigate('#jobs')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Open Roles
              </DepartmentButton>
            </DepartmentCard>
          ))}
        </DepartmentsGrid>
      </DepartmentsContainer>
    </DepartmentsSection>
  );
};

export default CareerDepartments;

