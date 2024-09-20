import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { z } from "zod";

const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Please enter a title name.",
  }),
  short_description: z.string().min(1, {
    message: "Please enter a short description.",
  }),
  meta_description: z.string().min(1, {
    message: "Please enter a meta description.",
  }),
  tags: z.string().min(1, {
    message: "Please enter atleast one tag.",
  }),
  author_name: z.string().min(1, {
    message: "Please enter an author name.",
  }),
  slug: z.string().min(1, {
    message: "Please enter a slug.",
  }),
  category_id: z.string().min(1, {
    message: "Please select a category.",
  }),
});

const CreatePost = () => {
  const [editorHtml, setEditorHtml] = useState<string>(
    __ISMSIE__ ? "<p>&nbsp;</p>" : ""
  );

  // const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      short_description: "",
      meta_description: "",
      tags: "",
      author_name: "",
      slug: "",
      category_id: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [files, setFiles] = useState<File[]>([]);
  const reactQuillRef = useRef<ReactQuill>(null);
  const inputOpenImageRef = useRef<HTMLInputElement>(null);

  const handleChange = (html: string) => {
    setEditorHtml(html);
  };

  const imageHandler = () => {
    inputOpenImageRef.current?.click();
  };

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      const file = e.currentTarget.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", `${Date.now()}.jpg`);

      try {
        const response = await axiosInstance.post(
          "/common/file-upload",
          formData,
          {
            headers: { "content-type": "multipart/form-data" },
          }
        );

        if (response.data.success) {
          const quill = reactQuillRef.current?.getEditor();
          const range = quill?.getSelection();
          const position = range ? range.index : 0;

          // Insert the image into the Quill editor
          quill?.insertEmbed(position, "image", response.data.data);
          quill?.setSelection(position + 1);

          // Update editorHtml state
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          const updatedHtml = quill.root.innerHTML;
          setEditorHtml(updatedHtml);

          // Update files state
          setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, file];
            return updatedFiles;
          });
        } else {
          alert("Failed to upload file");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const [selectedImage, setSelectedImage] = useState<unknown | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setImgUrl(imageUrl);
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-3xl font-semibold">
                Create New Post
              </h1>
              <Button variant={`default`}>Create</Button>
            </div>
            <div className="mt-10 flex flex-col md:flex-row gap-5">
              <div className="md:flex-[70%]">
                <div
                  className={`${
                    selectedImage ? "h-72" : "h-72"
                  } relative flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-md`}
                >
                  {selectedImage ? (
                    <div>
                      <img
                        src={imgUrl || ""}
                        alt="Selected"
                        className="h-44 md:h-72 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <h1 className="text-2xl font-medium text-gray-500">
                      Blog Banner
                    </h1>
                  )}
                  <input
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    type="file"
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <div className="w-full flex-1">
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter Blog Title"
                              {...field}
                              className="mt-5 px-3 md:px-4 py-3 md:py-4 w-full text-base md:text-xl bg-gray-100 border-b-2 border-gray-200 rounded-md outline-none"
                            />
                          </FormControl>
                        </FormItem>

                        <FormMessage className="mt-3 text-red-500" />
                      </div>
                    )}
                  />
                </div>
                <div className="mt-5">
                  <div>
                    <div id="toolbar">
                      <select
                        className="ql-header"
                        defaultValue={""}
                        onChange={(e) => e.persist()}
                      >
                        <option value="1" />
                        <option value="2" />
                        <option value="3" />
                        <option value="" />
                      </select>
                      <button className="ql-bold" />
                      <button className="ql-italic" />
                      <button className="ql-underline" />
                      <button className="ql-strike" />
                      <button className="ql-insertImage" onClick={imageHandler}>
                        <Image />
                      </button>
                      <button className="ql-link" />
                      <button className="ql-code-block" />
                      <button className="ql-blockquote" />
                      <button className="ql-list" value="ordered" />
                      <button className="ql-list" value="bullet" />
                      <button className="ql-indent" value="-1" />
                      <button className="ql-indent" value="+1" />
                      <button className="ql-align" />
                      <button className="ql-script" value="sub" />
                      <button className="ql-script" value="super" />
                      <button className="ql-check" />
                      <button className="ql-clean" />
                    </div>
                    <ReactQuill
                      ref={reactQuillRef}
                      theme="snow"
                      onChange={handleChange}
                      modules={modules}
                      formats={formats}
                      value={editorHtml}
                      placeholder="Write something awesome..."
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={inputOpenImageRef}
                      style={{ display: "none" }}
                      onChange={insertImage}
                    />
                  </div>
                </div>
              </div>
              <div className="md:flex-[30%]">
                <div className="py-6 px-3 md:px-5 border-2 border-gray-300 rounded-sm">
                  <h1 className="mb-3 text-lg font-medium">Category</h1>
                  <div className="w-full">
                    <Select>
                      <SelectTrigger className="text-black font-medium outline-none">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="text-black font-medium">
                        <SelectItem value="1">Category 1</SelectItem>
                        <SelectItem value="2">Category 2</SelectItem>
                        <SelectItem value="3">Category 3</SelectItem>
                        <SelectItem value="4">Category 4</SelectItem>
                        <SelectItem value="5">Category 5</SelectItem>
                        <SelectItem value="6">Category 6</SelectItem>
                        <SelectItem value="7">Category 7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 py-6 px-3 md:px-5 border-2 border-gray-300 rounded-sm">
                  <h1 className="mb-3 text-lg font-medium">Tags</h1>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <div className="w-full flex-1">
                          <FormItem>
                            <FormControl>
                              <Input
                                className="px-3 md:px-4 py-2 w-full text-sm md:text-base bg-gray-100 border-b-2 border-gray-200 rounded-md outline-none"
                                type="text"
                                placeholder="Enter Tags"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>

                          <FormMessage className="mt-3 text-red-500" />
                        </div>
                      )}
                    />
                  </div>
                  <p className="mt-3 text-sm text-black font-medium">
                    *Separate tags with commas.
                  </p>
                </div>
                <div className="mt-3 py-6 px-3 md:px-5 border-2 border-gray-300 rounded-sm">
                  <h1 className="mb-3 text-lg font-medium">
                    Short Description
                  </h1>

                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <div className="w-full flex-1">
                        <FormItem>
                          <FormControl>
                            <textarea
                              className="px-3 md:px-4 py-3 h-32 w-full text-sm md:text-base bg-gray-100 border-b-2 border-gray-200 rounded-md resize-none outline-none"
                              placeholder="Enter Short Description"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>

                        <FormMessage className="mt-3 text-red-500" />
                      </div>
                    )}
                  />
                </div>
                <div className="mt-3 py-6 px-3 md:px-5 border-2 border-gray-300 rounded-sm">
                  <h1 className="mb-3 text-lg font-medium">Meta Description</h1>

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <div className="w-full flex-1">
                        <FormItem>
                          <FormControl>
                            <textarea
                              className="px-3 md:px-4 py-3 h-32 w-full text-sm md:text-base bg-gray-100 border-b-2 border-gray-200 rounded-md resize-none outline-none"
                              placeholder="Enter Short Description"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>

                        <FormMessage className="mt-3 text-red-500" />
                      </div>
                    )}
                  />
                </div>
                <div className="mt-3 py-6 px-3 md:px-5 border-2 border-gray-300 rounded-sm">
                  <h1 className="mb-3 text-lg font-medium">Author Name</h1>
                  <FormField
                    control={form.control}
                    name="author_name"
                    render={({ field }) => (
                      <div className="w-full flex-1">
                        <FormItem>
                          <FormControl>
                            <Input
                              className="px-3 md:px-4 py-2 w-full text-sm md:text-base bg-gray-100 border-b-2 border-gray-200 rounded-md resize-none outline-none"
                              type="text"
                              placeholder="Enter Author Name"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>

                        <FormMessage className="mt-3 text-red-500" />
                      </div>
                    )}
                  />
                </div>
                <div className="mt-3 py-6 px-3 md:px-5 border-2 border-gray-300 rounded-sm">
                  <h1 className="mb-3 text-lg font-medium">Slug Name</h1>
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <div className="w-full flex-1">
                        <FormItem>
                          <FormControl>
                            <Input
                              className="px-3 md:px-4 py-2 w-full text-sm md:text-base bg-gray-100 border-b-2 border-gray-200 rounded-md resize-none outline-none"
                              type="text"
                              placeholder="Enter Slug Name"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>

                        <FormMessage className="mt-3 text-red-500" />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      insertImage: () => {}, // Handled separately
    },
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "image",
  "link",
  "code-block",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "align",
  "script",
  "subscript",
  "superscript",
  "check",
  "clean",
];

export default CreatePost;
