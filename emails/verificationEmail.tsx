import { Text, Heading, Button } from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  otp: string;
}

export default function VerificationEmail({
  name,
  otp,
}: VerificationEmailProps) {
  return (
    <table
      align="center"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      className="my-[16px] h-[424px] rounded-[12px] bg-blue-600"
      role="presentation"
      style={{
        // This url must be in quotes for Yahoo
        backgroundImage: "url('/static/my-image.png')",
        backgroundSize: "100% 100%",
      }}
      width="100%"
    >
      <tbody>
        <tr>
          <td align="center" className="p-[40px] text-center">
            <Text className="m-0 font-semibold text-gray-200">
              Verification Email
            </Text>
            <Heading as="h1" className="m-0 mt-[4px] font-bold text-white">
              Hello {name},
            </Heading>
            <Text className="m-0 mt-[8px] text-[16px] text-white leading-[24px]">
              Uncover the power of accent furniture in transforming your space
              with subtle touches of style, personality, and functionality, as
              we explore the art of curating captivating accents.
            </Text>
            <Button
              className="mt-[24px] rounded-[8px] border border-gray-200 border-solid bg-white px-[40px] py-[12px] font-semibold text-gray-900"
              onClick={() => {
                navigator.clipboard.writeText(otp);
                alert("Copied to clipboard");
              }}
            >
              {otp}
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
