import { z } from "zod";

export default z.object({
  fullname: z.string().nonempty("Fullname is required"),
  purok: z.string().nonempty("purok is required"),
  grupo: z.string().nonempty("grupo is required"),
  gender: z.enum(["male", "female"]),
});
