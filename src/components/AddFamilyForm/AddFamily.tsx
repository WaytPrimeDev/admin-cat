import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

import styles from "./AddFamily.module.css";
import { useAppDispatch, type RootState } from "../../store";
import {
  familySchema,
  type FamilyFormValues,
} from "../../validation/familySchema";
import { createFamily } from "../../store/slices/familiesSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";

interface AddFamilyFormProps {
  editShowForm: Dispatch<SetStateAction<boolean>>;
}

const AddFamilyForm = ({ editShowForm }: AddFamilyFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      dad: undefined,
      mom: undefined,
    },
  });
  console.log(errors);

  const { items: kittens } = useSelector((state: RootState) => state.kittens);
  const { items: parents } = useSelector((state: RootState) => state.parents);
  const { breeds } = useSelector((state: RootState) => state.filters);
  const dispatch = useAppDispatch();

  const showKittens = useMemo(
    () => kittens.filter((kitten) => kitten.familyId === null),
    [kittens],
  );
  // const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const sexParents = useMemo(() => {
    const mom = parents.filter((parent) => parent.sex === "female");
    const dad = parents.filter((parent) => parent.sex === "male");
    return {
      mom,
      dad,
    };
  }, [parents]);

  const onSubmit = async (data: FamilyFormValues) => {
    try {
      // Дожидаемся создания семьи
      await dispatch(createFamily(data)).unwrap();

      // Перезапрашиваем связанные данные, так как они изменились на сервере
      dispatch(fetchKittens());
      dispatch(fetchParents());

      editShowForm(false);
      reset();
    } catch (error) {
      console.error("Ошибка при создании:", error);
    }
  };
  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <label>Название помета:</label>
          <input type="text" {...register("name")} required />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Порода</label>
          <select {...register("breed")}>
            <option value="">Не выбрана</option>
            {breeds.map((breed) => (
              <option key={breed._id} value={breed.name}>
                {breed.name}
              </option>
            ))}
          </select>
        </div>
        {errors && (
          <span className="error" style={{ color: "red", fontSize: "12px" }}>
            {errors.breed?.message}
          </span>
        )}

        <div className={styles.formGroup}>
          <label>Котята (выберите минимум одного):</label>
          <div className={styles.checkboxGroup}>
            {showKittens.map((kitten) => (
              <label key={kitten._id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  {...register("kittens")}
                  value={kitten._id}
                />
                {kitten.nameUa}
              </label>
            ))}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Мама (опционально):</label>
          <select {...register("mom")}>
            <option value="">Не выбрана</option>
            {sexParents.mom.map((parent) => (
              <option key={parent._id} value={parent._id}>
                {parent.nameUa}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Папа (опционально):</label>
          <select {...register("dad")}>
            <option value="">Не выбран</option>
            {sexParents.dad.map((parent) => (
              <option key={parent._id} value={parent._id}>
                {parent.nameUa}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.submitBtn}>
          Создать
        </button>
      </form>
    </>
  );
};
export default AddFamilyForm;
