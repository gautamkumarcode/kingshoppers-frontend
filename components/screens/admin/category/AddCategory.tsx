"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DrawerForm() {
	//   const [open, setOpen] = useState(false);

	const handleSubmit = (e: any) => {
		e.preventDefault();
		const data = new FormData(e.target);
		const item = {
			name: data.get("name"),
			price: data.get("price"),
			desc: data.get("desc"),
		};
		console.log("✅ Item saved:", item);
	};

	return (
		<div>
			<h1 className=" flex mb-4 text-2xl justify-center items-center font-semibold">
				Add Category
			</h1>
			<form onSubmit={handleSubmit} className="space-y-5">
				<div>
					<Label htmlFor="name">Item Name</Label>
					<Input id="name" name="name" placeholder="Enter item name" required />
				</div>

				<div>
					<Label htmlFor="price">Price</Label>
					<Input
						id="price"
						name="price"
						type="number"
						placeholder="Enter price"
						required
					/>
				</div>

				<div>
					<Label htmlFor="desc">Description</Label>
					<textarea
						id="desc"
						name="desc"
						placeholder="Enter description"
						className="w-full border rounded-lg p-2 text-gray-700 dark:text-white dark:bg-gray-800"
						rows={3}
					/>
				</div>

				<div>
					<Label
						htmlFor="image"
						className="text-gray-700 dark:text-white font-medium">
						Upload Image
					</Label>
					<input
						id="image"
						type="file"
						accept="image/*"
						className="mt-2 w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<Button
					type="submit"
					className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md">
					Save Item
				</Button>
			</form>
		</div>
	);
}
