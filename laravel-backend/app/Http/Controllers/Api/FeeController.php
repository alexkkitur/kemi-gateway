<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\FeeInvoice;
use App\Models\FeeItem;
use Illuminate\Http\Request;

class FeeController extends Controller
{
    /** List all active fee items */
    public function items()
    {
        return response()->json(FeeItem::where('is_active', true)->orderBy('category')->get());
    }

    /**
     * Calculate and return (or create) the fee invoice for an application.
     * Body params:
     *   units_registered  int  (number of units student is registering)
     *   has_transcript    bool
     *   has_exam_card     bool
     */
    public function invoice(Request $r, Application $application)
    {
        abort_unless(
            $application->student_id === $r->user()->id
            || in_array($r->user()->primaryRole(), ['admission_officer', 'super_admin']),
            403
        );

        $data = $r->validate([
            'units_registered' => ['required', 'integer', 'min:0', 'max:20'],
            'has_transcript'   => ['required', 'boolean'],
            'has_exam_card'    => ['required', 'boolean'],
        ]);

        $items    = FeeItem::where('is_active', true)->get()->keyBy('category');
        $lines    = [];
        $subtotal = 0;

        // Course base fee
        $courseFee = (float) optional($application->course)->fee ?? 0;
        if ($courseFee > 0) {
            $lines[] = ['name' => 'Course / Programme Fee', 'category' => 'course', 'amount' => $courseFee, 'qty' => 1, 'line_total' => $courseFee];
            $subtotal += $courseFee;
        }

        // Per-unit fee
        $unitItem = $items->get('unit');
        if ($unitItem && $data['units_registered'] > 0) {
            $lineTotal = $unitItem->amount * $data['units_registered'];
            $lines[] = [
                'fee_item_id' => $unitItem->id,
                'name'        => $unitItem->name,
                'category'    => 'unit',
                'amount'      => (float) $unitItem->amount,
                'qty'         => $data['units_registered'],
                'line_total'  => $lineTotal,
            ];
            $subtotal += $lineTotal;
        }

        // Transcript fee
        if ($data['has_transcript'] && $items->has('transcript')) {
            $item = $items->get('transcript');
            $lines[] = [
                'fee_item_id' => $item->id,
                'name'        => $item->name,
                'category'    => 'transcript',
                'amount'      => (float) $item->amount,
                'qty'         => 1,
                'line_total'  => (float) $item->amount,
            ];
            $subtotal += (float) $item->amount;
        }

        // Exam card fee
        if ($data['has_exam_card'] && $items->has('exam_card')) {
            $item = $items->get('exam_card');
            $lines[] = [
                'fee_item_id' => $item->id,
                'name'        => $item->name,
                'category'    => 'exam_card',
                'amount'      => (float) $item->amount,
                'qty'         => 1,
                'line_total'  => (float) $item->amount,
            ];
            $subtotal += (float) $item->amount;
        }

        // Registration fee (always applies, once)
        if ($items->has('registration')) {
            $item = $items->get('registration');
            $lines[] = [
                'fee_item_id' => $item->id,
                'name'        => $item->name,
                'category'    => 'registration',
                'amount'      => (float) $item->amount,
                'qty'         => 1,
                'line_total'  => (float) $item->amount,
            ];
            $subtotal += (float) $item->amount;
        }

        $invoice = FeeInvoice::updateOrCreate(
            ['application_id' => $application->id],
            [
                'student_id'       => $application->student_id,
                'line_items'       => $lines,
                'subtotal'         => $subtotal,
                'discount'         => 0,
                'total'            => $subtotal,
                'units_registered' => $data['units_registered'],
                'has_transcript'   => $data['has_transcript'],
                'has_exam_card'    => $data['has_exam_card'],
                'status'           => 'pending',
            ]
        );

        return response()->json($invoice->fresh());
    }

    /** Get existing invoice for an application */
    public function show(Application $application)
    {
        $invoice = FeeInvoice::where('application_id', $application->id)->firstOrFail();
        return response()->json($invoice);
    }
}
