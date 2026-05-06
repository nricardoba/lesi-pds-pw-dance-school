import { useState } from 'react';
import { formatDateForInput } from '../utils/scheduleUtils';

export const useScheduleModals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [prefillClass, setPrefillClass] = useState(null);
  const [forceCreateMode, setForceCreateMode] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [preferredClassDate, setPreferredClassDate] = useState(() => formatDateForInput(new Date()));
  
  const [activeSlotMenu, setActiveSlotMenu] = useState(null);
  const [activeClassMenu, setActiveClassMenu] = useState(null);
  
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [templateTargetSlot, setTemplateTargetSlot] = useState(null);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDuration, setTemplateDuration] = useState(1);
  const [templateError, setTemplateError] = useState('');

  return {
    isModalOpen, setIsModalOpen,
    editingClass, setEditingClass,
    prefillClass, setPrefillClass,
    forceCreateMode, setForceCreateMode,
    classToDelete, setClassToDelete,
    preferredClassDate, setPreferredClassDate,
    activeSlotMenu, setActiveSlotMenu,
    activeClassMenu, setActiveClassMenu,
    isTemplatePickerOpen, setIsTemplatePickerOpen,
    templateTargetSlot, setTemplateTargetSlot,
    templateOptions, setTemplateOptions,
    selectedTemplate, setSelectedTemplate,
    templateDuration, setTemplateDuration,
    templateError, setTemplateError
  };
};
