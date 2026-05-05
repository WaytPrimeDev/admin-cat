import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateParentSchema, type UpdateParentFormValues } from '../../validation/ParentSchema';
import { useAppDispatch } from '../../store';
import { updateParent } from '../../store/slices/parentsSlice';
import { type Parent } from '../../types';
import styles from './EditParentForm.module.css';

interface EditParentFormProps {
  parent: Parent;
  onClose: () => void;
}

const EditParentForm: React.FC<EditParentFormProps> = ({ parent, onClose }) => {
  const dispatch = useAppDispatch();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [retainedImages, setRetainedImages] = useState<string[]>(parent.images.map(img => img.full));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateParentFormValues>({
    resolver: zodResolver(updateParentSchema),
    defaultValues: {
      nameUa: parent.nameUa,
      nameEn: parent.nameEn,
      color: parent.color,
      breed: parent.breed,
      sex: parent.sex,
      retainedImages,
      newImages: [],
    },
  });

  useEffect(() => {
    setValue('retainedImages', retainedImages);
  }, [retainedImages, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setValue('newImages', files);
    }
  };

  const removeRetainedImage = (url: string) => {
    setRetainedImages(prev => prev.filter(img => img !== url));
  };

  const onSubmit = async (data: UpdateParentFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();

    // Add retained images
    formData.append('retainedImages', JSON.stringify(data.retainedImages));

    // Add new files
    selectedFiles.forEach(file => {
      formData.append('photos', file);
    });

    // Add text fields
    formData.append('nameUa', data.nameUa);
    formData.append('nameEn', data.nameEn);
    formData.append('color', data.color);
    formData.append('breed', data.breed);
    formData.append('sex', data.sex);

    try {
      await dispatch(updateParent({ id: parent._id, formData })).unwrap();
      alert('Parent updated successfully');
      onClose();
    } catch (error) {
      alert('Failed to update parent: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2>Edit Parent</h2>

      {/* Text fields */}
      <div>
        <label>Name UA</label>
        <input {...register('nameUa')} />
        {errors.nameUa && <span>{errors.nameUa.message}</span>}
      </div>

      <div>
        <label>Name EN</label>
        <input {...register('nameEn')} />
        {errors.nameEn && <span>{errors.nameEn.message}</span>}
      </div>

      <div>
        <label>Color</label>
        <input {...register('color')} />
        {errors.color && <span>{errors.color.message}</span>}
      </div>

      <div>
        <label>Breed</label>
        <input {...register('breed')} />
        {errors.breed && <span>{errors.breed.message}</span>}
      </div>

      <div>
        <label>Sex</label>
        <select {...register('sex')}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.sex && <span>{errors.sex.message}</span>}
      </div>

      {/* Retained Images */}
      <div>
        <h3>Current Images</h3>
        <div className={styles.images}>
          {retainedImages.map(url => (
            <div key={url} className={styles.imageContainer}>
              <img src={url} alt="Parent" className={styles.image} />
              <button type="button" onClick={() => removeRetainedImage(url)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* New Images */}
      <div>
        <label>Add New Images</label>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} />
        {errors.newImages && <span>{errors.newImages.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update Parent'}
      </button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
};

export default EditParentForm;