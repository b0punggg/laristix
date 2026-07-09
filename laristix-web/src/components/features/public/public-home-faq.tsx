"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/design-system/primitives/layout";
import { Text } from "@/design-system/primitives/text";
import { publicFaqItems } from "@/lib/public-faq-items";

export function PublicHomeFaqSection() {
  return (
    <section className="bg-surface py-12 md:py-20">
      <Container className="max-w-3xl">
        <div className="mb-10 text-center">
          <Text variant="overline" className="text-brand">
            FAQ
          </Text>
          <Text variant="h2" className="mt-2">
            Pertanyaan yang sering diajukan
          </Text>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {publicFaqItems.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium hover:text-brand">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
