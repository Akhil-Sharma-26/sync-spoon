import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NewMenuItem {
  date: string;
  food_item_id: number;
  meal_type: string;
}

const AddMenuItem: React.FC = () => {
  const [date, setDate] = useState<string>('');
  const [foodItemId, setFoodItemId] = useState<string>('');
  const [mealType, setMealType] = useState<string>('');

  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, NewMenuItem>({
    mutationFn: (newItem: NewMenuItem) =>
      fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      }).then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({
      date,
      food_item_id: parseInt(foodItemId, 10),
      meal_type: mealType
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        value={date}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
      />
      <input
        type="number"
        value={foodItemId}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFoodItemId(e.target.value)}
      />
      <select
        value={mealType}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setMealType(e.target.value)}
      >
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
      </select>
      <button type="submit">Add to Menu</button>
    </form>
  );
};

export default AddMenuItem;