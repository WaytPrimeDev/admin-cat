// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   updateFamilySchema,
//   type UpdateFamilyFormValues,
// } from "../../validation/familySchema";
// import { useAppDispatch, type RootState } from "../../store";
// import { updateFamily } from "../../store/slices/familiesSlice";
// import { fetchKittens } from "../../store/slices/kittensSlice";
// import { fetchParents } from "../../store/slices/parentsSlice";
// import { type Family } from "../../types";
// import styles from "./EditFamilyForm.module.css";
// import { useSelector } from "react-redux";

// interface EditFamilyFormProps {
//   family: Family;
//   onClose: () => void;
// }

// const EditFamilyForm: React.FC<EditFamilyFormProps> = ({ family, onClose }) => {
//   const dispatch = useAppDispatch();
//   const { items: kittens } = useSelector((state: RootState) => state.kittens);
//   const { items: parents } = useSelector((state: RootState) => state.parents);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<UpdateFamilyFormValues>({
//     resolver: zodResolver(updateFamilySchema),
//     defaultValues: {
//       name: family.name,
//       displayOrder: family.displayOrder,
//       mom: family.parents.mom,
//       dad: family.parents.dad,
//       kittensIds: family.kittens,
//     },
//   });

//   useEffect(() => {
//     dispatch(fetchKittens());
//     dispatch(fetchParents());
//   }, [dispatch]);

//   const mom = watch("mom") || "";
//   const dad = watch("dad") || "";
//   const selectedKittenIds = watch("kittensIds") || [];

//   const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const values = e.target.selectedOptions;
//     setValue("mom", values);
//   };

//   const handleKittenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const values = Array.from(
//       e.target.selectedOptions,
//       (option) => option.value,
//     );
//     setValue("kittensIds", values);
//   };

//   const onSubmit = async (data: UpdateFamilyFormValues) => {
//     setIsSubmitting(true);
//     try {
//       await dispatch(updateFamily({ id: family._id, data })).unwrap();
//       alert("Family updated successfully");
//       onClose();
//     } catch (error) {
//       alert("Failed to update family: " + error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
//       <h2>Edit Family</h2>

//       <div>
//         <label>Name</label>
//         <input {...register("name")} />
//         {errors.name && <span>{errors.name.message}</span>}
//       </div>

//       <div>
//         <label>Display Order</label>
//         <input
//           type="number"
//           {...register("displayOrder", { valueAsNumber: true })}
//         />
//         {errors.displayOrder && <span>{errors.displayOrder.message}</span>}
//       </div>

//       <div>
//         <label>Parents</label>
//         <select multiple value={mom} onChange={handleParentChange}>
//           {parents.map((parent) => (
//             <option key={parent._id} value={parent._id}>
//               {parent.nameEn} ({parent.sex})
//             </option>
//           ))}
//         </select>
//         {errors.parentIds && <span>{errors.parentIds.message}</span>}
//       </div>

//       <div>
//         <label>Kittens</label>
//         <select
//           multiple
//           value={selectedKittenIds}
//           onChange={handleKittenChange}
//         >
//           {kittens.map((kitten) => (
//             <option key={kitten._id} value={kitten._id}>
//               {kitten.nameEn} ({kitten.sex})
//             </option>
//           ))}
//         </select>
//         {errors.kittensIds && <span>{errors.kittensIds.message}</span>}
//       </div>

//       <button type="submit" disabled={isSubmitting}>
//         {isSubmitting ? "Updating..." : "Update Family"}
//       </button>
//       <button type="button" onClick={onClose}>
//         Cancel
//       </button>
//     </form>
//   );
// };

// export default EditFamilyForm;
