import bcrypt from "bcrypt";

async function hashPasword() {
  const text = process.argv[2];
  console.log(bcrypt.hashSync(text, 12));
}

hashPasword();
