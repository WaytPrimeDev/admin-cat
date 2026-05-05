import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateKittenSchema,
  type UpdateKittenFormValues,
} from "../../validation/kittenSchema";
import { useAppDispatch } from "../../store";
import { updateKitten } from "../../store/slices/kittensSlice";
import { type Kitten } from "../../types";
import styles from "./EditKittenForm.module.css";

interface EditKittenFormProps {
  kitten: Kitten;
  onClose: () => void;
}

const EditKittenForm: React.FC<EditKittenFormProps> = ({ kitten, onClose }) => {
  const dispatch = useAppDispatch();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [retainedImages, setRetainedImages] = useState<string[]>(
    kitten.images.map((img) => img.full),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateKittenFormValues>({
    resolver: zodResolver(updateKittenSchema),
    defaultValues: {
      nameUa: kitten.nameUa,
      nameEn: kitten.nameEn,
      color: kitten.color,
      birthDay: kitten.birthDay,
      breed: kitten.breed,
      sex: kitten.sex,
      breeding: kitten.price.breeding?.toString() || "",
      pet: kitten.price.pet?.toString() || "",
      retainedImages,
      newImages: [],
    },
  });

  useEffect(() => {
    setValue("retainedImages", retainedImages);
  }, [retainedImages, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setValue("newImages", files);
    }
  };

  const removeRetainedImage = (url: string) => {
    setRetainedImages((prev) => prev.filter((img) => img !== url));
  };

  const onSubmit = async (data: UpdateKittenFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();

    // Add retained images
    formData.append("retainedImages", JSON.stringify(data.retainedImages));

    // Add new files
    selectedFiles.forEach((file) => {
      formData.append("photos", file);
    });

    // Add text fields
    formData.append("nameUa", data.nameUa);
    formData.append("nameEn", data.nameEn);
    formData.append("color", data.color);
    formData.append("birthDay", data.birthDay);
    formData.append("breed", data.breed);
    formData.append("sex", data.sex);
    formData.append("breeding", data.breeding);
    formData.append("pet", data.pet);

    try {
      await dispatch(updateKitten({ id: kitten._id, formData })).unwrap();
      alert("Kitten updated successfully");
      onClose();
    } catch (error) {
      alert("Failed to update kitten: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2>Edit Kitten</h2>

      {/* Text fields */}
      <div>
        <label>Name UA</label>
        <input {...register("nameUa")} />
        {errors.nameUa && <span>{errors.nameUa.message}</span>}
      </div>

      <div>
        <label>Name EN</label>
        <input {...register("nameEn")} />
        {errors.nameEn && <span>{errors.nameEn.message}</span>}
      </div>

      <div>
        <label>Color</label>
        <input {...register("color")} />
        {errors.color && <span>{errors.color.message}</span>}
      </div>

      <div>
        <label>Birth Day</label>
        <input type="date" {...register("birthDay")} />
        {errors.birthDay && <span>{errors.birthDay.message}</span>}
      </div>

      <div>
        <label>Breed</label>
        <input {...register("breed")} />
        {errors.breed && <span>{errors.breed.message}</span>}
      </div>

      <div>
        <label>Sex</label>
        <select {...register("sex")}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.sex && <span>{errors.sex.message}</span>}
      </div>

      <div>
        <label>Breeding Price</label>
        <input {...register("breeding")} />
      </div>

      <div>
        <label>Pet Price</label>
        <input {...register("pet")} />
      </div>

      {/* Retained Images */}
      <div>
        <h3>Current Images</h3>
        <div className={styles.images}>
          {retainedImages.map((url) => (
            <div key={url} className={styles.imageContainer}>
              <img src={url} alt="Kitten" className={styles.image} />
              <button type="button" onClick={() => removeRetainedImage(url)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* New Images */}
      <div>
        <label>Add New Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        {errors.newImages && <span>{errors.newImages.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Kitten"}
      </button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
};

export default EditKittenForm;
