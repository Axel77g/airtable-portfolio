import bcrypt from "bcrypt";

/**
 * fonction utilisé pour hash rapidement un mdp (utile pour création de compte dans airtable)
 */
async function hashPasword() {
  const text = process.argv[2];
  console.log(bcrypt.hashSync(text, 12));
}

hashPasword();
