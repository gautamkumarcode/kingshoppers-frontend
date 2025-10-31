// DrawerForm.jsx
import React, { useState } from "react";
import {  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription, } from "@/components/ui/drawer"; // ✅ shadcn drawer import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DrawerForm({open ,setOpen}:{open:boolean,setOpen:(arg0: boolean)=>void}) {
//   const [open, setOpen] = useState(false);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const item = {
      name: data.get("name"),
      price: data.get("price"),
      desc: data.get("desc"),
    };
    console.log("✅ Item saved:", item);
    setOpen(false);
  };

  return (

      <Drawer open={open} onOpenChange={setOpen}>
      {/* 🔘 Drawer Trigger */}
      <DrawerTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 mb-10 text-white px-4 py-2 rounded-lg shadow-md">
          + Add Item
        </Button>
      </DrawerTrigger>

      {/* 🪟 Drawer Content */}
      <DrawerContent className="fixed bottom-10 left-0 right-0 mx-auto w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl p-6 shadow-lg">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            Add New Item
          </DrawerTitle>
          <DrawerDescription className="text-sm text-gray-500">
            Fill in the item details below.
          </DrawerDescription>
        </DrawerHeader>


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
        <Label htmlFor="image" className="text-gray-700 dark:text-white font-medium">
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"
          >
            Save Item
          </Button>
        </form>

        <DrawerFooter className="flex justify-end mt-4 ">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
 
  );
}
